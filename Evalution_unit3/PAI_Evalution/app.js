// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfHOV_NPDdop5WAbNv-lP6NXcGwWq3prc",
  authDomain: "quickcart-4baaa.firebaseapp.com",
  projectId: "quickcart-4baaa",
  storageBucket: "quickcart-4baaa.firebasestorage.app",
  messagingSenderId: "321387591685",
  appId: "1:321387591685:web:2be4b6f52bc0a541f2446c",
  measurementId: "G-NQX58RK623"
};

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  const itemRef = db.ref('items');

  const form = document.getElementById('add-item-form')
  const inputName = document.getElementById('item-name');
  const inputQty = document.getElementById('item-qty');
  const inputPrice = document.getElementById('item-price');
  const inputCategory = document.getElementById('item-category');

  const filters = document.getElementById('.filters');
  const itemList = document.getElementById('item-list');
  const totalItemSpan = document.getElementById('total-items');
  const grandCostSpan = document.getElementById('grand-cost')
  const undoToast = document.getElementById('undo-toast')
  const undoBtn = document.getElementById('undo-btn');

  const PENDING_KEY = 'localstorage.pending';
  const LAST_DELETED_KEY = 'localstorage.lastdeleted';

  let allItems = {};
  let currentFilter = "All";
  let uno=doTimeoutId = null;
  let lastDeleted = null;


  function getPendingQueue(){
    const q = localStorage.getItem('PENDING_KEY');
    return q ? JSON.parse(q) : [];
  }
  function setPendingQueue(){
    localStorage.setItem('PENDING_KEY',JSON.stringify(queue));
  }

  function clearForm(){
    inputName.value = '';
    inputQty.value = '';
    inputPrice.value = '';
    inputCategory.value = '';
    inputName.focus();
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();

    const name = inputName.value.trim();
    const qty = parseInt(inputQty.value);
    const price = parseInt(inputPrice.value);
    const category = inputCategory.value;

    if(!name || qty < 1 || price <= 0 || !category){
        alert('please fill all deatils vailed values');
        return;
    }
    if(navigator.onLine){
        itemRef.push(newItem).then(clearForm).catch(() => {
            queueItem(newItem);
            clearForm();
        });
    }else{
        queueItem(newItem);
        clearForm();
    }

  });

  function queueItem(item) {
    const queue = getPendingQueue();
    queue.push(item);
    setPendingQueue(queue);
    
  }

  window.addEventListener('online',() => {
    let queue = getPendingQueue();
    if(queue.length === 0)
        return;

    queue.forEach(() => {
        const  item = queue[0];
        itemRef.push(item).then(()=>{
            queue.shift();
            setPendingQueue(queue);
        });

    });
  });
  filters.addEventListener('click',()=>{
    if(e.target.tagName === "BUTTON"){
        currentFilter  = e.target.dataset.filter;
        renderList();
    }
  });
  function renderList(){
    itemList.innerHTML = "";
    const iterArr = Object.entries(allItems).map(([id,item])=>
        ({id,...item }));
    const filtered = currentFilter === "All" ? iterArr : iterArr.filter(i => i.category === currentFilter);

    let totalQty = 0; totalCost= 0;
    filtered.forEach(item =>{
        totalQty += item.qty;
        totalCost += item.qty * item.price;

        const li = document.createElement('li');
        li.textContent = `${item.name} * ${item.qty} - $${item.price} * ${item.qty}.toFixed(2)` });



        const delBtn = document.createElement('button');
        delBtn.textContent = "";
        
        delBtn.addEventListener('click',() =>{
            deleteItem(item.id,item);
            li.appendChild(delBtn);

            itemList.appendChild(li)
        });


        undoBtn.addEventListener('click' , () =>{
            if(!lastDeleted)
                return;
            itemRef.child(lastDeleted.id).set(lastDeleted.itemData).then(() =>{
                undoToast.style.display = 'none';
                localStorage.removeItem('LAST_DELETED_KEY');
                lastDeleted = null;
            
            }).catch(()=> alert('undo failed'))
        })
  }
