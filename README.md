# agora-tool
agora tool for edTech



##create openssl keys
openssl req -newkey rsa:2048 -nodes -keyout key.pem -x509 -days 365 -out certificate.pem



run project 
sudo http-server ./ -p 443 --ssl -C certificate.pem -K key.pem