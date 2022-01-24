# Compute@Edge Service

fastly service create --name="Fastly Logs Realtime Analytics" --type=wasm
fastly backend create --version=latest --name="gdn_url" --address="api-gdn.paas.macrometa.io" --port=443
