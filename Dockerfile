FROM node:18
WORKDIR /app
COPY package.json package-lock.json ./  # Явное копирование
RUN npm install
COPY . .
CMD ["npm", "start"]