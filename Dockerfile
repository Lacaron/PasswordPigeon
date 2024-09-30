# Use Node.js as the base image
FROM node:14

# Set the working directory
WORKDIR /app

# Copy the backend files
COPY backend/package.json ./backend/
RUN cd backend && npm install

# Copy the backend and frontend files
COPY backend ./backend/
COPY frontend ./frontend/

# Expose the port
EXPOSE 80

# Start the server
CMD ["node", "backend/server.js"]