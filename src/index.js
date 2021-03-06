var webix = require('webix');

fetch('http://localhost:3000/data').then(res=>res.json()).then(function draw(data){
  let userSet =data.userSet,
    roleOption=data.roleOption;
  // utlity functions
  /**
   * @description this function finds whether provided id present in the elemment of the array
   * @param {Array} arr given array in which id to be matched
   * @param {number} id given to find if present in array 
   */
  function findIndex(arr, id) {
    for (let index = 0; index < arr.length; index++) {
      const element = arr[index];
      if(element.id === id) return index;
    }
    return -1;
  }
  /**
   * @description saves the employee details to the view and sends to the backend to store
  */
  function saveEmpDetails(){
    const values = $$("empForm").getValues();
    // if update to be done instead adding
    if (values.id){
      let indexOfItem = findIndex(userSet, values.id);
      if ( indexOfItem >= 0) {
        userSet[indexOfItem] = values;
      }
      $$("addEmpDetails").define('value', 'Add');
      $$("addEmpDetails").refresh();
    }
    else {  // for new employee details
      userSet.push({
        name: values.name, email: values.email, role: values.role,id:userSet.length
      });
    }
    //setting data
    $$("empList").define("data", userSet);
    $$("empList").refresh();
    $$("empForm").clear();
    // sends data to the backend
    fetch('http://localhost:3000/userset',{method: 'post',  headers: {
      'Content-Type': 'application/json'
    }, body: JSON.stringify({"userSet": userSet})});
  }
  /**
   * @description This function takes care of edit, add of roles
   */
  function saveRoles () {
    let roles = document.querySelectorAll('.role-edit'),
      editedRoles = [],
      newRole = $$('newRole').getValue();
    roles.forEach(role => editedRoles.push(role.value));
    if (newRole){
      editedRoles.push(newRole);
    }
    $$("editlist").clearAll();
    $$("editlist").define('data', editedRoles);
    $$("editlist").refresh();
    $$("role").define('options', editedRoles);
    $$("role").refresh();
    // sends latest role details to backend
    fetch('http://localhost:3000/roleoption',{method: 'post',headers: {
      'Content-Type': 'application/json'
    }, body: JSON.stringify({"roleOption": editedRoles})});
  }
  /**
   * @description This function takes care of delition of roles
   */
  function deleteRoles () {
    let role = $$("editlist").getSelectedId();
    if(findIndex(roleOption, role) !== -1) {
      roleOption.splice(findIndex(roleOption, role), 1);
      $$("editlist").remove(role);
      $$("editlist").refresh();
      $$("role").define('options', roleOption);
      $$("role").refresh();
      // sends latest role details to backend
      fetch('http://localhost:3000/roleoption',{method: 'post',  headers: {
        'Content-Type': 'application/json'
      }, body: JSON.stringify({"roleOption": roleOption})});
    }
  }
  /**
   * @description This function takes care of delition of user details
   */
  function delete_row(){
    let id = $$("empList").getSelectedId();
    
    webix.confirm({
      title: "Delete",// the text of the box header
      text: "Are you sure you want to delete the selected record?",
      callback: function(result) { 
        if (result) {
          $$("empList").remove(id);
          $$("empForm").clear();
          $$("addEmpDetails").define('value', 'Add');
          $$("addEmpDetails").refresh();
          // sends latest role details to backend
          fetch('http://localhost:3000/userset',{method: 'post',  headers: {
            'Content-Type': 'application/json'
          }, body: JSON.stringify({"userSet": Array.from($$("empList").data.getRange())})});
        } 
      }
    });
  }



  // rendering part

  // custom widget creation
  webix.protoUI({
  
    name: "canvas_layers",
    
    $init() {
      // First canvas
      this.cv1 = document.createElement('canvas');
      this.$view.appendChild(this.cv1);
      
    },
    
    $setSize(width, height) {
      this.cv1.width = width;
      this.cv1.height = height;      
      this.render();
    },
    
    render() {      
      // Draw first canvas
      const ctx1 = this.cv1.getContext('2d');  
      ctx1.fillStyle = "#ff0000ff";
      ctx1.fillRect(0, 0, this.cv1.width * .7, this.cv1.height * .7);
      
    },
    
  }, webix.ui.view);
 // main container
  webix.ui({
    rows: [
      { view:"toolbar", id:"mybar",
        elements:[
          { view:"button", id:"addEmpDetails", css:"addEmpDetails",value:"Add", width:100, click: saveEmpDetails }, 
          { view:"button", id:"removeEmpDetails", css:"removeEmpDetails", value:"Remove", width:100, click: delete_row},
          { view:"button", id:"clearForm", css: "clearForm", value:"Clear", width:100 , click:() => $$("empForm").clear()},
          { view:"button", id:"configureRoles", css:"configureRoles", value:"Configure Roles", width:300 ,popup:"role_pop"}
        ]
      },
      { cols:[
        {
          view:"form", id:"empForm", width:200, elements:[
            { view:"text", name:"name", placeholder:"Name", width:180, align:"center"}, 
            { view:"text", name:"email", placeholder:"Email", width:180, align:"center"}, 
            { view:"combo", id:"role", name:"role",placeholder:"Role", width:300,  options: roleOption},
            {
              view: "canvas_layers"
            }
          ]
        },
        {
          view:"list", 
          id:"empList",
          template:"Name: #name# &nbsp&nbsp&nbsp&nbsp Email: #email# &nbsp&nbsp&nbsp&nbsp Role: #role#", 
          select:true, //enables selection 
          height:400,
          data: userSet
        } 
      ]}
    ]
  });
  //popup component
  webix.ui({
    view:"popup",
    id:"role_pop",
    css:'popup-container',
    width:300,
    height: 400,
    body: {
      view: "form",
      id:"roleForm", 
      width:300, 
      elements:[
        { view:"list", template:`<input class= "role-edit" type ="text" value="#value#" />`, id:"editlist", name:"editlist", width:180, data:roleOption, select:true},
        { view:"text", id:"newRole", name:"newRole", placeholder:"New Role", width:180},
        {view:"toolbar",borderless:true,
          cols:[
            { view:"button", id:"saveRole", value:"Save Roles", width:120, click: saveRoles },
            { view:"button", id:"removeRole", value:"Remove", width:120, click: deleteRoles }
          ]
        }
      ]
    }
  });
  
  $$("empList").attachEvent("onAfterSelect", function(id){
    const item = $$("empList").getItem(id);
    $$("empForm").setValues(item);
    $$("addEmpDetails").define('value', 'Update');
    $$("addEmpDetails").refresh();
  });
  
});
