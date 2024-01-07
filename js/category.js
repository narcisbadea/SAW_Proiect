// js/category.js

class Category {
  constructor(id, name, description, creation_date) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.creation_date = creation_date;
  }
}

class Categories {
  constructor() {
    this.id = "categories";
    this.children = null;
  }

  read() {
    const categories = this;

    // Assuming your PHP script for reading categories is in categories/read.php
    $.ajax({
      url: "./php/categories/read.php",
      beforeSend: function (xhr) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
      },
    }).done(function (data) {
      categories.onRead(JSON.parse(data));
    });
  }

  onRead(data) {
    const items = data.items;

    this.children = items.map((item) => {
      return new Category(
        item.id,
        item.name,
        item.description,
        item.creation_date
      );
    });

    // Assuming you have a method to populate the navbar in your index.js
    populateNavbar(this.children);
  }
}
