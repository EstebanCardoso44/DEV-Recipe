# Dockerfile
# Use an existing node alpine image as a base image.
FROM node:18-alpine

# Set the working directory.
WORKDIR /api_hello_world

# Copy the package.json file.
COPY package.json .

# Install application dependencies.
RUN npm install express
RUN npm install cors
RUN npm un mysql
RUN npm install mysql2
RUN npm install --save-dev jest
RUN npm install bcrypt

# Copy the rest of the application files.
COPY . .

# Expose the port.
EXPOSE 2000

# Run the application.
CMD ["node", "app.js"]
