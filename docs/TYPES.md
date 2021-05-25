# UwUDB
## Tipos
Estos son los docs de los tipos que se exportan por el modulo

# Contenidos
- [Interfaces](#resultado-operacion)
  - [ResultadoOperacion](#resultado-operacion)
  - [OpcionesCliente](#Opciones-Cliente)

# Resultado Operacion
- [ResultadoOperacion.ok](#resultadooperacionok---boolean)
- [ResultadoOperacion.cambios](#resultadooperacioncambios)

### *ResultadoOperacion.ok* -> _boolean_
Esta propiedad demuestra si la operacion ha salido sin errores

### *ResultadoOperacion.documentos* -> _number_
La cantidad de documentos cambiados

# Opciones Cliente
- [OpcionesCliente.dir](#OpcionesClientedir---string)
- [OpcionesCliente.nombre](#OpcionesClientenombre---string)
- [OpcionesCliente.WAL](#OpcionesClientewal---boolean)
- [OpcionesCliente.verbose](#OpcionesCliente---function)

### *OpcionesCliente.dir* -> _string_
La ruta donde se formara la DB

### *OpcionesCliente.nombre* -> _string_
El nombre de el archivo de la DB

### *OpcionesCliente.WAL* -> _boolean_
Si se activara el [WAL mode](https://sqlite.org/wal.html) de sqlite

### *OpcionesCliente.verbose* -> _function_
Una funcion que se llamara cada vez que un statement se corra en la DB
