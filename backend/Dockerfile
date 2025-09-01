# Stage 1: Build the 'crush' binary from source
FROM golang:1.22-alpine AS crush-builder

# Install git
RUN apk add --no-cache git

# Clone the crush repository
RUN git clone https://github.com/charmbracelet/crush.git /crush

# Set the working directory
WORKDIR /crush

# Build the crush binary
RUN go build -o /crush-binary

# ---

# Stage 2: Final Python application image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies required for some Python packages
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# Copy the compiled crush binary from the builder stage into the final image
# This is more secure and reliable than using a curl script.
COPY --from=crush-builder /crush-binary /usr/local/bin/crush

# Verify that crush is installed and executable
RUN crush --version

# Copy the requirements file into the container
COPY requirements.txt ./

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container
COPY . .

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application
# This will be overridden by docker-compose for the celery worker
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
