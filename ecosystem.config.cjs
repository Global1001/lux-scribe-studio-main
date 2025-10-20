module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "./",
      script: "pnpm",
      args: "run start",
      env: {
        PORT: 8082
      }
    },
    {
      name: "backend",
      cwd: "./backend",
      script: "uvicorn",
      args: "app.main:app --host 0.0.0.0 --port 8001",
      interpreter: "python3",
      env: {
        PORT: 8001
      }
    }
  ]
}; 