let envDictionary

const getEnvDictionary = () => {
    if (!envDictionary) {
        envDictionary = new Dictionary("env")
    }

    return envDictionary
}

export const getEnv = (key) => {
    const envDictionary = getEnvDictionary()
    return envDictionary.get(key)
}
