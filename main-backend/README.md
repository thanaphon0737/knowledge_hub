# Main backend

## Todo list

### Docker
- [x] set up docker for database on local port 5433(5432 in docker connection)
    - [x] connect database on docker using Dbeaver (use port 5433 because 5432 was used by postgres local)
    - [x] node service connect with database in docker
    - [x] use volume for binding database
- [x] set up docker for node server on local port 3000
    - [x] install package for connect database
    - [x] install package for api 
    - [x] connect database in local(use port 5433)
    - [x] connect database in docker(use port 5432)
### Database setup
- [ ] create sql file
    - [x] create users table
    - [x] create documents table
- [ ] use migratation (if have time)
### API endpoint
- [x] first api endpoint run port 3000 local
    - [x] api return list of all table for debuging
- [ ] Design RESTful API endpoints
    - [ ] Define clear resource naming conventions
    - [ ] Use proper HTTP methods (GET, POST, PUT, DELETE)
    - [ ] Document endpoints with OpenAPI/Swagger
- [ ] Implement input validation and error handling
    - [ ] Validate request payloads
    - [ ] Return meaningful error messages and status codes
- [ ] Add authentication and authorization
    - [ ] Implement JWT or OAuth2
    - [ ] Protect sensitive endpoints
- [ ] Write unit and integration tests for endpoints
    - [ ] Use a testing framework (e.g., Jest, Mocha)
    - [ ] Mock database and external dependencies
- [ ] Set up logging and monitoring
    - [ ] Log requests and errors
    - [ ] Integrate with monitoring tools
### clean architecture
- [ ] project structure for clean architecture
    ### Suggested Git Branches

    - `feature/api-design`
    - `feature/api-validation`
    - `feature/api-auth`
    - `feature/api-testing`
    - `feature/api-logging`