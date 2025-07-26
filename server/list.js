const fs = require('fs');
const path = require('path');

const generateRandomId = () => {
    return new Date().getTime() + Math.floor(Math.random() * 1000);
};

class Product {
    constructor(ean, quantity = 1) {
        this.ean = ean;
        this.quantity = quantity;
    }

    setQuantity(quantity) {
        this.quantity = quantity;
    }
}

class List {
    constructor(name) {
        this.id = generateRandomId();
        this.name = name;
        this.products = [];
        this.lastModified = new Date();
        this.creationDate = new Date();
    }

    addProduct(product) {
        if (!this.products.includes(product)) {
            this.products.push(product);
        }
        this.lastModified = new Date();
    }

    removeProduct(product) {
        this.products = this.products.filter(p => p.ean !== product.ean);
        this.lastModified = new Date();
    }
}

class ListManager {
    constructor() {
        this.loadLists();
    }

    saveLists() {
        const fileName = 'lists.json';
        const data = JSON.stringify(this.lists || [], null, 2);
        const filePath = path.join(__dirname, fileName);
        try {
            fs.writeFileSync(filePath, data, 'utf8');
            console.log(`Lists saved to ${fileName}`);
        } catch (err) {
            console.error(`Error saving lists to ${fileName}:`, err);
        }
    }

    loadLists() {
        const fileName = 'lists.json';
        const filePath = path.join(__dirname, fileName);
        if (fs.existsSync(filePath)) {
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error reading ${fileName}:`, err);
                } else {
                    try {
                        this.lists = JSON.parse(data).map(listData => {
                            const list = new List(listData.name);
                            list.id = listData.id;
                            list.products = listData.products.map(productData => new Product(productData.ean, productData.quantity));
                            list.lastModified = new Date(listData.lastModified);
                            list.creationDate = new Date(listData.creationDate);
                            return list;
                        });
                        console.log(`Lists loaded from ${fileName}`);
                    } catch (parseError) {
                        console.error(`Error parsing ${fileName}:`, parseError);
                    }
                }
            });
        } else {
            console.log(`${fileName} does not exist. Starting with an empty list.`);
            this.lists = [];
        }
    }

    createList(name) {
        const newList = new List(name);
        this.lists.push(newList);
        return newList.id;
    }

    getListById(id) {
        if (typeof id !== 'number') {
            id = parseInt(id, 10);
        }
        return this.lists.find(list => list.id === id);
    }

    getAllLists() {
        return this.lists;
    }

    deleteList(id) {
        if (typeof id !== 'number') {
            id = parseInt(id, 10);
        }
        this.lists = this.lists.filter(list => list.id !== id);
    }
}

module.exports = { Product, List, ListManager };