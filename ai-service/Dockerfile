FROM python:3.12-slim

# Set the working directory inside the container
WORKDIR /app

# Set environment variables to prevent Python from writing .pyc files
# and to ensure output is sent straight to the terminal
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copy the requirements file first to leverage Docker's layer caching
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy your application code into the container
COPY ./app /app/app

# Expose the port that the Uvicorn server will run on
EXPOSE 8000

# The command to start the Uvicorn server for production
# Note: We do not use the --reload flag here.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]