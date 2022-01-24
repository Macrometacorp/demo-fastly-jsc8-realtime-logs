const { createCollectionWithSeedData, getDocuments } = require("./get-requests")
const { getDocument } = require("./post-requests")
const { updateDocuments } = require("./put-requests")

module.exports = {
    createCollectionWithSeedData,
    getDocument,
    getDocuments,
    updateDocuments,
}
