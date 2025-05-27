FROM node:22-alpine

COPY . /app

WORKDIR /app

# Use npm instead of yarn to avoid yarn.lock corruption
RUN npm install

ENV LISTEN_ADDRESS=0.0.0.0
ENV PORT=80

# Use JSON format for CMD to avoid signal handling issues
CMD ["npm", "start"]

EXPOSE 80
