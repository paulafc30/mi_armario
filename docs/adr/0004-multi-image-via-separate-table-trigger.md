# ADR-0004: Multi-imagen vía tabla separada + trigger de portada

**Estado:** aceptado
**Fecha:** 2026-05-09

## Contexto

Originalmente cada prenda tenía un único `image_url` en la tabla `clothes`. Cuando llegamos a "permitir varias fotos por prenda" (necesario para Wallapop/Vinted, que aceptan hasta 5-6 fotos), había que decidir el modelado.

Lo mismo pasó después con outfits: queríamos poder añadir fotos propias del outfit (e.g., una foto con el look puesto), no solo el mosaico de portadas de las prendas.

## Decisión

Usar una **tabla separada** `clothe_images` (y luego `outfit_images`) con `1:N` desde la entidad padre. Mantenemos la columna `image_url` (y `cover_image_url` para outfits) en la tabla padre como **denormalización de la portada**, sincronizada por un **trigger PostgreSQL**.

```sql
-- Estructura:
create table clothe_images (
  id, clothe_id (FK), user_id, url, path, position, created_at
);

-- Trigger que mantiene clothes.image_url apuntando a la primera imagen:
create function sync_cover_image() returns trigger as $$
begin
  update clothes set image_url = (
    select url from clothe_images
    where clothe_id = NEW.clothe_id
    order by position asc, created_at asc
    limit 1
  ) where id = NEW.clothe_id;
  return NEW;
end;
$$;

create trigger clothe_images_sync_cover
  after insert or update or delete on clothe_images
  for each row execute procedure sync_cover_image();
```

El frontend escribe en `clothe_images` y **nunca** toca `clothes.image_url` directamente. El trigger se encarga.

El campo `position` ordena las imágenes; "portada" = posición más baja. Cambiar la portada en UI = reordenar el array. El usuario también puede arrastrar las miniaturas para reordenar (HTML5 drag-drop).

## Alternativas consideradas

### Array en la tabla padre

```sql
alter table clothes add column image_urls text[];
```

Más simple, pero:
- Limita el tipo de operaciones que se pueden hacer eficientemente (no se puede indexar bien por posición individual).
- Reordenar o borrar requiere reescribir el array completo desde el cliente.
- Mezclar storage paths y URLs en estructura paralela es confuso (`image_paths text[]`).

### Mantener solo `image_url`, fotos extra en otra "cosa"

Forzar a usar solo una foto por prenda. Descartado: la usuaria necesita varias para Wallapop/Vinted.

### Calcular `image_url` en una vista o query a demanda

Sin denormalización: cada vez que leemos prendas, hacemos un JOIN con `clothe_images` para sacar la portada.

- **Performance**: más caro en cada query de listado.
- **Complejidad en queries**: cualquier código que asume `clothe.image_url` tendría que cambiar a un JOIN.
- Aunque cacheable con React Query, multiplica las queries y la latencia inicial.

→ La denormalización con trigger nos da lo mejor de ambos mundos: una sola fuente de verdad para escribir (`clothe_images`), pero lectura rápida desde el campo denormalizado (`clothes.image_url`).

## Consecuencias

### Positivas

- **Lecturas rápidas**: las listas (Mi Armario, Venta) siguen funcionando con un solo SELECT a `clothes`.
- **Una sola fuente de verdad**: si cambia algo en `clothe_images`, el trigger sincroniza. No hay riesgo de desincronía.
- **Limpieza al borrar prenda**: `ON DELETE CASCADE` borra los registros de `clothe_images`. El frontend además itera y borra los archivos del Storage (no los deja huérfanos).
- **Reordenable**: cambiar `position` reordena. Drag-drop en `MultiImagePicker` está implementado.

### Negativas

- Los **triggers son magia "invisible"** para quien lee solo el frontend. Hay que documentarlo (lo hacemos aquí).
- Si llegamos a Supabase Edge Functions o alguna lógica server-side, el trigger se ejecuta también ahí — fácil olvidarlo.
- Una **inserción individual dispara N triggers** si insertamos varias filas en batch. En la práctica, las prendas tienen 1-5 imágenes, no es un cuello de botella.

### Restricciones que esto impone

- Las imágenes **siempre se gestionan vía las tablas `*_images`**, nunca directamente sobre `clothes.image_url` o `outfits.cover_image_url`. El frontend lo respeta — `MultiImagePicker` actualiza solo la tabla hijo.
- El trigger solo se activa en `INSERT/UPDATE/DELETE` de filas. Si por alguna razón se reordenara con un `UPDATE` masivo de `position`, hay que asegurarse de que dispara N veces. Implícito en la definición `FOR EACH ROW`.
- El path en Storage no se borra desde el trigger (las operaciones del bucket son fuera de Postgres). El frontend lo borra explícitamente desde `useDeleteClothe` / `useDeleteOutfit`.
