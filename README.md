# Demo Video stream app
This project is made as a template for scalable and flexible API endpoints, Video streaming and User-Address management.

## [Live Demo](https://demo-video-stream.herokuapp.com/swagger)
## [![App](https://raw.githubusercontent.com/IvanDimanov/demo-video-stream/master/image.png)](https://demo-video-stream.herokuapp.com/swagger)

## Tech stack
- fastify: [https://www.fastify.io/](https://www.fastify.io/)
- objection: [https://vincit.github.io/objection.js/](https://vincit.github.io/objection.js/)
- Swagger: [https://github.com/fastify/fastify-swagger](https://github.com/fastify/fastify-swagger)
- TypeScript: [https://www.typescriptlang.org/](https://www.typescriptlang.org/)

## Run locally
### Clone repo
```
git clone git@github.com:IvanDimanov/demo-video-stream.git
cd ./demo-video-stream
npm ci
cp .env.example .env
```

### Sync Database
Make sure the `DB_URL` ENV VAR in `.env` is accessible.
```
npm run db-migrate-latest
npm run db-seed
```

### Run the app
```
npm start
```

Open Swagger Docs [http://localhost:8000/swagger](http://localhost:8000/swagger)
Open Video Streaming app [http://localhost:8000/app](http://localhost:8000/app)


## Tests
We use `mocha` and `chai` for our unit tests.
```
npm run test
```

Test coverage and report
```
npm run test-report
```
