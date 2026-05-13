# Use a specific version of Node.js based on Alpine Linux for a smaller image size
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available) first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies to keep the image lean
RUN npm install --omit=dev

# Copy the rest of the application source code
COPY . .

# Expose the port your app runs on (change 3000 to your actual port if different)
EXPOSE 3000

# Run the application as a non-root user for better security
USER node

# Start the server using the command defined in package.json
CMD ["npm", "start"]
