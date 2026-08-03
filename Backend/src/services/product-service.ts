import { OkPacketParams } from "mysql2";
import { ProductModel } from "../models/product-model";
import { dal } from "../utils/dal";
import { ClientError } from "../models/client-error";
import { StatusCode } from "../models/enums";
import { appConfig } from "../utils/app-config";
import { saver } from "smart-saver";

// Products logic:
class ProductService {

    // Get all products:
    public async getAllProducts(): Promise<ProductModel[]> {
        const sql = "select *, concat(?, imgUrl) as imageUrl from products";
        const values = [appConfig.productImagesBaseUrl];
        const products = await dal.execute(sql, values) as ProductModel[];
        return products;
    }

    // Get one product:
    public async getOneProduct(id: number): Promise<ProductModel> {
        const sql = "select *, concat(?, imgUrl) as imageUrl from products where id = ?";
        const values = [appConfig.productImagesBaseUrl, id];
        const products = await dal.execute(sql, values) as ProductModel[];
        const product = products[0];
        if (!product) {
            throw new ClientError(StatusCode.NotFound, `id ${id} not found.`);
        }
        return product;
    }

    // Add product:
    public async addProduct(product: ProductModel): Promise<ProductModel> {
        product.validate();
        const imageName = await saver.save(product.image);
        const sql = "insert into products(name, price, stock, imgUrl) values(?, ?, ?, ?)";
        const values = [product.name, product.price, product.stock, imageName];
        const info = await dal.execute(sql, values) as OkPacketParams;
        const dbProduct = await this.getOneProduct(info.insertId!);
        return dbProduct;
    }

    // Update product:
    public async updateProduct(product: ProductModel): Promise<ProductModel> {
        product.validate();
        const oldImageName = await this.getImageName(product.id);
        const newImageName = await saver.update(product.image, oldImageName!);
        const sql = "update products set name = ?, price = ?, stock = ?, imgUrl = ? where id = ?";
        const values = [product.name, product.price, product.stock, newImageName, product.id];
        const info = await dal.execute(sql, values) as OkPacketParams;
        if (info.affectedRows === 0) {
            throw new ClientError(StatusCode.NotFound, `id ${product.id} not found.`);
        }
        const dbProduct = await this.getOneProduct(product.id);
        return dbProduct;
    }

    // Delete product:
    public async deleteProduct(id: number): Promise<void> {
        const oldImageName = await this.getImageName(id);
        const sql = "delete from products where id = ?";
        const values = [id];
        const info = await dal.execute(sql, values) as OkPacketParams;
        if (info.affectedRows === 0) {
            throw new ClientError(StatusCode.NotFound, `id ${id} not found.`);
        }
        await saver.delete(oldImageName!);
    }

    // Get image name from db:
    private async getImageName(id: number): Promise<string | null> {
        const sql = "select imgUrl as imageName from products where id = ?";
        const values = [id];
        const products = await dal.execute(sql, values) as ProductModel[];
        const product = products[0];
        if (!product) return null;
        return product.imageName;
    }

    // Get top three products:
    public async getTopProducts(): Promise<ProductModel[]> {
        const sql = "select *, concat(?, imgUrl) as imageUrl from products order by price desc limit 3";
        const values = [appConfig.productImagesBaseUrl];
        const products = await dal.execute(sql, values) as ProductModel[];
        return products;
    }

}

export const productService = new ProductService();