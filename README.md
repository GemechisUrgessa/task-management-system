## How to Run the Project

1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```sh
    task-management-system
    ```
3. Start the Docker containers:
    ```sh
    docker-compose up --build
    ```
4. Access the backend container:
    ```sh
    docker exec -it task-management-system-backend-1 /bin/bash
    ```

## Creating and Running Migrations
- Relations are only created when the migration is run.

## Creating and Running Migrations

- To create a migration use:
    ```sh
    docker exec -it task-management-system-backend-1 npm run migration:generate
    ```
- To run the migration use:
    ```sh
    docker exec -it task-management-system-backend-1 npm run migration:run
    ``` 

- To create a migration use:
  ```sh
  docker exec -it task-management-system-backend-1 npm run migration:generate
  ```
- To run the migration use:
  ```sh
  docker exec -it task-management-system-backend-1 npm run migration:run
  ```