import Sqlite from 'better-sqlite3'

declare interface ResultadoOperacion {
    ok: boolean
    documentos: number
}

declare interface OpcionesCliente {
    dir: string
    nombre: string
    WAL?: boolean
    verbose?: any
}

type DocumentoType<T extends {}> = T & Documento<T>

declare class Documento<TEsquema> {
    /**
     * La id del documento, normalmente es una sring
     */
    public _id: TEsquema._id | string

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
    /**
     * El esquema de la db
     */
    public Esquema: Esquema

    /**
     * El nombre de la db
     */
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
     * Busca un doc con la busqueda propuesta
     * @param Busqueda - Busca un doc con las propiedades puestas aqui
     */
    public buscarUno(Busqueda: Partial<TEsquema>): DocumentoType<TEsquema>

    /**
     * Busca varios documentos a la vez
     * @param Busqueda - La busqueda de lo que estas buscando, si no se pone se daran todos los docs de toda la tabla
     * @param limite - El limite de documentos que quieres obtener, si no se pone nada te dara todos los docs con esa busqueda
     */
    public buscar(Busqueda?: Partial<TEsquema>, limite?: number): DocumentoType<TEsquema>[]

    /**
     * Actualiza **un** documento
     * @param Busqueda - El filtro para encontrar el documento a actulizar
     * @param obj - Los nuevos datos de el documento
     */
    public actualizarUno(Busqueda: Partial<TEsquema>, obj: Partial<TEsquema>): DocumentoType<TEsquema>

    /**
     * Elimina un documento
     * @param Filtro - El filtro para encontrar el documento
     */
    public eliminarUno(Filtro: Partial<TEsquema>): ResultadoOperacion

    /**
     * Elimina varios documentos con el mismo filtro
     * @param Filtro - El filtro para eliminar varios documentos, dejalo vacio para eliminar todos los documentos de esta DB
     */
    public eliminarVarios(Filtro: Partial<TEsquema>): ResultadoOperacion

    /**
     * Elimar un documento por su _id
     * @param _id La ID de un documento
     */
    public eliminarPorId(_id: any): Promise<ResultadoOperacion>
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