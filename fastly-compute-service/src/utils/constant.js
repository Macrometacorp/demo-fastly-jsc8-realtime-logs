export const GMT_OFFSET_REGEX = /.GMT([+-]\d+).+/
export const REQUEST_METHODS = {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    OPTIONS: "OPTIONS",
}

export const COLLECTION_NAME = "fastly_users"
export const RESTQL_QUERIES = {
    GET_DOCUMENT: "fastlyGetItem",
}

export const API_PATHS = {
    INIT: "/init",
    DOCUMENT: "/documents",
    COLLECTION_KEY: "/collections/key",
    COLLECTION_QUERY: "/collections/query",
}

export const GDN_API_PATHS = {
    EXECUTE_RESTQL: "/restql/execute",
    DOCUMENT: "/document",
    COLLECTION: "/collection",
}

export const DICTIONARY_ITEM_KEYS = {
    LOGGING: "logging_endpoint_name",
    BACKEND: "backend_name",
    API_URL: "gdn_api_url",
    API_KEY: "gdn_api_key",
}
