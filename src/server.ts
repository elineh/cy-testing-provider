import { server } from './server-config'

const port = process.env.PORT || 3001

server.listen(port, () => console.log(`listening on port ${port}`))
