// js/product.js

var DataHandler = (function () {
  function DataHandler() {}

  DataHandler.prototype.fetchData = function (
    url,
    successCallback,
    errorCallback
  ) {
    $.ajax({
      url: url,
      beforeSend: function (xhr) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
      },
    })
      .done(function (data) {
        successCallback(JSON.parse(data));
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        errorCallback(errorThrown);
      });
  };

  return DataHandler;
})();

var Product = (function () {
  function Product(
    id,
    producator,
    model,
    pret,
    creation_date,
    category,
    image,
    properties_names,
    properties_values
  ) {
    this.id = id;
    this.producator = producator;
    this.model = model;
    this.pret = pret;
    this.creation_date = creation_date;
    this.category = category;
    this.image = image;
    this.properties_names = properties_names || [];
    this.properties_values = properties_values || [];
  }

  return Product;
})();

var Products = (function () {
  var instance;
  var _categorieProdus;
  function Products() {
    if (instance) {
      return instance;
    }

    this.children = null;
    this.dataHandler = new DataHandler();
    instance = this;
  }

  Products.prototype.read = function (categorieProdus) {
    if (categorieProdus) {
      _categorieProdus = categorieProdus;
    } else {
      categorieProdus = _categorieProdus;
    }

    $("#main-panel").empty();

    var productsInstance = this;
    this.dataHandler.fetchData(
      `./php/products/read.php?read=1&category=${categorieProdus}`,
      function (data) {
        productsInstance.onRead(data);
      },
      function (error) {
        console.error(`Error fetching data: ${error}`);
      }
    );
  };

  Products.prototype.onRead = function (data) {
    var items = data.items;
    if (items && items.length > 0) {
      this.children = items.map(function (item) {
        return new Product(
          item.id,
          item.producator,
          item.model,
          item.pret,
          item.creation_date,
          item.category,
          item.image,
          item.properties_names || [],
          item.properties_values || []
        );
      });

      this.show();

      // Fetch category properties for the first product
      const firstProduct = this.children[0];
      if (firstProduct) {
        this.fetchCategoryProperties(
          firstProduct.category,
          this.onCategoryPropertiesFetched.bind(this),
          function (error) {
            console.error(`Error fetching category properties: ${error}`);
          }
        );
      }
    }
  };

  Products.prototype.onCategoryPropertiesFetched = function (data) {
    this.categoryProperties = data.items || [];
  };

  Products.prototype.fetchCategoryProperties = function (
    category,
    successCallback,
    errorCallback
  ) {
    const url = `./php/products/read_properties.php?category=${category}`;

    this.dataHandler.fetchData(url, successCallback, errorCallback);
  };

  Products.prototype.show = function () {
    if (!this.children || this.children.length === 0) {
      console.error("No products available.");
      return;
    }

    var container = $('<div class="row row-cols-1 row-cols-md-3 g-4"> </div>');

    // Display each product
    this.children.forEach(function (product) {
      var imageTag = product.image
        ? `<img src="data:image/jpeg;base64,${product.image}" class="card-img-top product-image" alt="Product Image">`
        : "";

      var productCard = $(
        `<div class="col">
          <div class="card h-100 product-card">
            <div class="card-body">
              <h5 class="card-title">${product.producator} ${product.model}</h5>
              ${imageTag}
            </div>
            <div class="card-footer">
              <p class="card-text price">Pret: ${product.pret}</p>
              <p class="card-text created-at">Created at: ${product.creation_date}</p>
              <div class="btn-group">
                <button type="button" class="btn btn-primary view-btn" data-id="${product.id}">Vezi</button>
                <button type="button" class="btn btn-warning edit-btn" data-id='${product.id}'>Editează</button>
                <button type="button" class="btn btn-danger delete-btn" data-id="${product.id}">Șterge</button>
              </div>
            </div>
          </div>
        </div>`
      );

      container.append(productCard);
    });

    $("#main-panel").append(container);
  };

  Products.prototype.viewProduct = function (id) {
    if (this.children) {
      var product = this.getProduct(id);

      if (product) {
        $("#main-panel").empty();
        this.fetchCategoryProperties(
          product.category,
          this.onCategoryPropertiesFetched.bind(this),
          function (error) {
            console.error(`Error fetching category properties: ${error}`);
          }
        );
        this.displaySingleProduct(product);
      } else {
        console.error(`Product with ID ${id} not found.`);
      }
    } else {
      console.error("No products available.");
    }
  };

  Products.prototype.displaySingleProduct = function (product) {
    console.log(product);
    const imageTag = product.image
      ? `<img src="data:image/jpeg;base64,${product.image}" class="card-img-top product-image" alt="Product Image">`
      : "";

    const propertiesList =
      Array.isArray(product.properties_names) &&
      Array.isArray(product.properties_values)
        ? product.properties_names
            .map((name, index) => {
              const value = product.properties_values[index];
              return `<p class="card-text">${name.substring(5).replace('_', ' ')}: ${value}</p>`;
            })
            .join("")
        : "";

    const productDetails = $(
      `<div class="card product-details">
              <div class="row">
                  <div class="col-md-6">
                      <div class="product-image-container">
                          ${imageTag}
                      </div>
                  </div>
                  <div class="col-md-6">
                      <div class="card-body">
                          <h5 class="card-title">${product.producator} ${product.model}</h5>
                          <p class="card-text">Pret: ${product.pret}</p>
                          <p class="card-text">Created at: ${product.creation_date}</p>
                          ${propertiesList}
                          <div class="btn-group">
                              <button type="button" class="btn btn-warning edit-btn" data-id='${product.id}'>Editează</button>
                              <button type="button" class="btn btn-danger delete-btn" data-id="${product.id}">Șterge</button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>`
    );

    $("#main-panel").append(productDetails);
  };

  Products.prototype.deleteProduct = function (id) {
    const productsInstance = this;

    $.ajax({
      type: "POST",
      url: "./php/products/delete.php",
      data: { id: id },
      success: function (response) {
        productsInstance.read();
      },
      error: function (error) {
        console.error("Error deleting product: ", error);
      },
    });
  };

  Products.prototype.getProduct = function (id) {
    console.log(this.children);
    if (this.children) {
      return this.children.find(function (product) {
        return product.id === id;
      });
    } else {
      console.error("No products available.");
      return null;
    }
  };

  return Products;
})();
