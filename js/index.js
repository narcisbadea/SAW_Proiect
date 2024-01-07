document.addEventListener("DOMContentLoaded", function () {
  fetchContent("navbar.html", "navbar-container");
  fetchContent("main-content.html", "main-content-container", init);
});

function init() {
  loadDefaultCategory();
  fetchAndPopulateCategories();

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("view-btn"))
      onViewButtonClick.call(event.target);
    if (event.target.classList.contains("delete-btn"))
      onDeleteButtonClick.call(event.target);
    if (event.target.id === "addProductBtn") onAddProductButtonClick();
    if (event.target.classList.contains("edit-btn"))
      onEditButtonClick.call(event.target);
  });

  document.addEventListener("change", function (event) {
    if (
      event.target.id === "addCategory" ||
      event.target.id === "editCategory"
    ) {
      onCategoryChange.call(event.target);
    }
  });
}

function fetchContent(url, containerId, callback) {
  const container = document.getElementById(containerId);
  if (container) {
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        container.innerHTML = data;
        if (callback) callback();
      });
  }
}

function loadDefaultCategory() {
  const defaultCategory = "smartphones";
  loadCategory(defaultCategory);
}

function loadCategory(category) {
  const products = new Products();
  products.read(category);
}

function onViewButtonClick() {
  const productId = $(this).data("id");
  viewProduct(productId);
}

function onDeleteButtonClick() {
  const productId = $(this).data("id");
  deleteProduct(productId);
}

function onEditButtonClick() {
  const productData = $(this).data("id");
  editProduct(productData);
}

function onAddProductButtonClick() {
  const formData = new FormData($("#addProductForm")[0]);
  addProduct(formData);
}
function logFormData(formData) {
  console.log("FormData contents:");

  formData.forEach((value, key) => {
    console.log(key, value);
  });
}
function addProduct(formData) {
  $.ajax({
    type: "POST",
    url: "./php/products/create.php",
    data: formData,
    processData: false,
    contentType: false,
    success: function (response) {
      $("#addProductModal").modal("hide");
      loadDefaultCategory();
    },
    error: function (error) {
      console.error("Error adding product: ", error);
    },
  });
}

function fetchAndPopulateCategories() {
  $.ajax({
    url: "./php/categories/read.php",
    beforeSend: function (xhr) {
      xhr.overrideMimeType("text/plain; charset=x-user-defined");
    },
  }).done(function (data) {
    const categories = JSON.parse(data).items;
    const addDropdown = $("#addCategory");
    addDropdown.empty();
    categories.forEach(function (category) {
      addDropdown.append(
        $("<option></option>").attr("value", category.name).text(category.name)
      );
    });
    const editDropdown = $("#editCategory");
    editDropdown.empty();
    categories.forEach(function (category) {
      editDropdown.append(
        $("<option></option>").attr("value", category.name).text(category.name)
      );
    });
  });
}

function getCategoryProperties(category) {
  const url = `./php/products/read_properties.php?category=${category}`;
  let properties = [];

  $.ajax({
    url: url,
    async: false,
    success: function (data) {
      properties = JSON.parse(data);
    },
    error: function (error) {
      console.error("Error fetching category properties: ", error);
    },
  });
  return properties;
}

function onCategoryChange() {
  const selectedCategory = $(this).val();
  $("#properties-container-add").empty();
  $("#properties-container-edit").empty();
  const properties = getCategoryProperties(selectedCategory);
  // Clear previous properties inputs
  console.log(properties.items);
  if (properties && properties.items && properties.items.length > 0) {
    // Add new properties inputs
    properties.items.forEach(function (property) {
      console.log(property.prop_name);
      var prop_n = property.prop_name.substring(5).replace("_", " ");
      const input = `<div class="mb-3">
                        <label for="${property.prop_name}" class="form-label">${prop_n}</label>
                        <input type="text" class="form-control" id="${property.prop_name}" name="${property.prop_name}" required />
                     </div>`;
      $("#properties-container-add").append(input);
      $("#properties-container-edit").append(input);
    });
  }
}

function editProduct(productData) {
  const products = new Products();
  const product = products.getProduct(productData);

  // Set the form fields with the product data
  $("#editProducator").val(product.producator);
  $("#editModel").val(product.model);
  $("#editPret").val(product.pret);
  $("#editCategory").val(product.category);

  // Clear the file input
  $("#editImage").val("");

  // Trigger category change to dynamically load properties inputs
  $("#editCategory").change();

  $("#editProductModal").modal("show");

  // Adapt and set the properties fields
  for (let i = 0; i < product.properties_names.length; i++) {
    const propName = product.properties_names[i];
    const propValue = product.properties_values[i];

    // Assuming property fields have IDs like 'editProp_Operating_System'
    console.log(propName + " " + propValue);

    // Use the property name to find the corresponding input field
    $(`#properties-container-edit input[name="${propName}"]`).val(propValue);
  }

  $(document).on("click", "#editProductBtn", function () {
    const updatedFormData = new FormData($("#editProductForm")[0]);
    updatedFormData.append("id", productData);
    updateProduct(updatedFormData);
  });
}

function viewProduct(productId) {
  const products = new Products();
  products.viewProduct(productId);
}

function deleteProduct(productId) {
  const products = new Products();
  products.deleteProduct(productId);
}

function updateProduct(updatedFormData) {
  $.ajax({
    type: "POST",
    url: "./php/products/update.php",
    data: updatedFormData,
    processData: false,
    contentType: false,
    success: function (response) {
      $("#editProductModal").modal("hide");
      loadDefaultCategory();
    },
    error: function (error) {
      console.error("Error updating product: ", error);
    },
  });
}
