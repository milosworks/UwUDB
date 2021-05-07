import Sqlite from "better-sqlite3"

declare interface OpcionesCliente {
    dir: string
    nombre: string
    WAL?: boolean
    verbose?: any
}

declare type DocumentoType<T extends {}> = T & Documento<T>

declare class Documento<TEsquema> {
    constructor(data: object, db: uwuDB<TEsquema>)

    eliminar(): Sqlite.RunResult
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
    public establecer(obj: Partial<TEsquema>): Sqlite.RunResult

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
     * Elimar un documento por su _id
     * @param _id La ID de un documento
     */
    public eliminarPorId(_id: string): Sqlite.RunResult
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
    private db: Sqlite.Database

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