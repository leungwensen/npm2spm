
# grouped tasks
make:
	make install
	make test
all:
	make preinstall
	make
	make publish

# tasks
preinstall:
	npm  install -g cnpm --registry=http://registry.npm.taobao.org
	cnpm  install -g spm
install:
	cnpm install
	npm install
test:
publish:
	npm publish
	cnpm sync package-helper

