# Imágenes Necesarias para el Juego

## Estructura de Carpetas

Las imágenes deben ir en estas ubicaciones dentro de `public/`:

```
public/
  ├── images/
  │   ├── stage0.png
  │   ├── stage1.png
  │   ├── stage2.png
  │   ├── stage3.png
  │   └── stage4.png
  └── abuela_cuetes.jpg
```

## Imágenes por Stage (Corrupción)

### Stage 0 - `public/images/stage0.png`
- **Corrupción:** 0
- **Descripción:** Perón solo (estado inicial, sin corrupción)
- **Estilo:** Imagen limpia, sin distorsión
- **Uso:** Aparece cuando no has cometido errores

### Stage 1 - `public/images/stage1.png`
- **Corrupción:** 1
- **Descripción:** Perón + partido
- **Estilo:** Ligeramente más oscuro/saturado que stage0
- **Uso:** Después de 1 respuesta incorrecta

### Stage 2 - `public/images/stage2.png`
- **Corrupción:** 2
- **Descripción:** Perón + Patilla
- **Estilo:** Más saturado, colores más intensos
- **Uso:** Después de 2 respuestas incorrectas

### Stage 3 - `public/images/stage3.png`
- **Corrupción:** 3
- **Descripción:** Corrupción leve (distorsión visual)
- **Estilo:** Contraste aumentado, saturación alta, más oscuro
- **Uso:** Después de 3 respuestas incorrectas

### Stage 4 - `public/images/stage4.png`
- **Corrupción:** 4-5
- **Descripción:** Colapso furry (máxima corrupción)
- **Estilo:** Máximo contraste, muy oscuro, saturación extrema, efecto "multiply" blend mode
- **Uso:** Después de 4-5 respuestas incorrectas

## Imagen Especial

### `public/abuela_cuetes.jpg`
- **Flag requerido:** `abuela_cuetes`
- **Descripción:** Imagen especial que reemplaza cualquier stage cuando tienes el flag `abuela_cuetes`
- **Uso:** Aparece automáticamente si respondiste mal a la pregunta sobre "hard power" y mencionaste la abuela con los cuetes

## Notas Técnicas

- **Formato:** PNG para stages (transparencia si es necesario), JPG para abuela_cuetes
- **Tamaño recomendado:** 1920x1080 o mayor (se usa `object-fit: cover` para llenar la pantalla)
- **Aspecto:** Las imágenes se recortan para llenar toda la pantalla, así que el contenido importante debe estar centrado
- **Filtros aplicados:** El código aplica filtros CSS automáticamente según el stage:
  - Stage 0: `contrast(1.05) brightness(0.98)`
  - Stage 1: `contrast(1.08) brightness(0.96)`
  - Stage 2: `contrast(1.1) brightness(0.94) saturate(1.1)`
  - Stage 3: `contrast(1.15) brightness(0.9) saturate(1.2)`
  - Stage 4: `contrast(1.2) brightness(0.85) saturate(1.3)` + `mix-blend-mode: multiply`

## Fallback

Si las imágenes no existen, el juego muestra gradientes de colores según el stage (rojo/azul/amarillo con el estilo "retro-propaganda distópica").
