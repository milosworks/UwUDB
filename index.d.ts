import Sqlite from 'better-sqlite3'

declare interface ResultadoOperacion {
    ok: boolean
    cambios: number
}

declare interface OpcionesCliente {
    dir: string
    nombre: string
    WAL?: boolean
    verbose?: any
}

type DocumentoType<T extends {}> = T & Documento<T>

declare class Documento<TEsquema> {
    constructor(data: object, db: uwuDB<TEsquema>)

    /**
     * Elimina el documento actual
     */
    eliminar(): ResultadoOperacion
    /**
     * Guarda los cambios en el objeto del documento
     */
    guardar(): DocumentoType<TEsquema>
}

declare class Esquema {
    public rawModel: object

    private properties: string[]
    private values: string[]
    private types: object

    constructor(obj: object)
}

declare class uwuDB<TEsquema> {
    public Esquema: Esquema
    public nombre: string

    /**
     * Crea una nueva db
     * @param nombre - El nombre de la db
     * @param esquema - El esquema de la db
     * @param client - El cliente de uwudb
     */
    constructor(nombre: string, esquema: Esquema, client: uwuCliente)

    /**
     * Establece un nuevo objeto dentro de la db
     * @param obj - El objeto a insertar en la db
     */
    public establecer(obj: Partial<TEsquema>): DocumentoType<TEsquema>

    /**
     * Busca un doc con la query propuesta
     * @param query - Busca un doc con las propiedades puestas aqui
     */
    public buscarUno(query: Partial<TEsquema>): DocumentoType<TEsquema>

    /**
     * Busca varios documentos a la vez
     * @param query - La query de lo que estas buscando, si no se pone se daran todos los docs de toda la tabla
     * @param limite - El limite de documentos que quieres obtener, si no se pone nada te dara todos los docs con esa query
     */
    public buscar(query?: Partial<TEsquema>, limite?: number): DocumentoType<TEsquema>[]

    /**
     * Actualiza **un** documento
     * @param query - El filtro para encontrar el documento a actulizar
     * @param obj - Los nuevos datos de el documento
     */
    public actualizarUno(query, obj): DocumentoType<TEsquema>

    /**
     * Elimar un documento por su _id
     * @param _id La ID de un documento
     */
    public eliminarPorId(_id: string): ResultadoOperacion
}

declare class uwuCliente {

    /**
     * Las opciones del cliente ingresadas en el constructor
     */
    public OpcionesCliente: OpcionesCliente

    /**
     * Todas las dbs creadas en un array
     */
    public Databases: uwuDB<any>[]

    /**
     * La DB de sqlite para que hagan request especificos
     */
    public db: Sqlite.Database

    /**
     * Crea al cliente de uwudb, en el que puedes crear una db
     * @param OpcionesCliente - Las opciones del cliente
     */
    constructor(OpcionesCliente: OpcionesCliente)

    /**
     * Crea una nueva db
     * @param nombre - El nombre de la nueva db
     * @param esquema - El esquema de la db
     */
    public crearDB<TEsquema>(nombre: string, esquema: Esquema): uwuDB<TEsquema>
}

/**
 * Valida una _id, el valor unico para identificar documentos de uwudb
 * @param _id - La _id para validar
 */
declare function validarID(_id: string): boolean

/**
 * Formatea un array en string para convertirlo a un array
 * @param array - El array dentro de una string
 */
declare function formatArray(array: string): any[]