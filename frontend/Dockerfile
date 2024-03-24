FROM node:alpine

WORKDIR /app

COPY package*.json .
RUN npm install
RUN npm install -g serve

COPY . .

ARG REACT_APP_BACKEND
ENV REACT_APP_BACKEND $REACT_APP_BACKEND

RUN npm run build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]