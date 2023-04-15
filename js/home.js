// Initilizing all the variables
const InputSearch = document.querySelector('#searchInput');
const ButtonSearch = document.querySelector('#searchButton');
const displayMealsElemet = document.querySelector('#displayMealsElement');
const ButtonFavourites = document.querySelector('#favouritesButton');
const iSearchresult = document.querySelector('#searchReasult-i');
const favouritesCount = document.querySelector('#favouritesCount');

let isInputFunctionEntered = false;
let searchResults = [];
let favCountFromLocalStorage = JSON.parse(localStorage.getItem('FAV'))?.length || 0;
const favouriteMessage = "<h1 class='text-black text-base italic mt-4'> No Favourties Found!! Please add some. </h1>";
favouritesCount.textContent = favCountFromLocalStorage;

// function to fetch data from api
const fetchFromApi = async (userInput, searchOpt, type) => {
   try { 

        if(!userInput || !searchOpt || !type) {
            return null;
        }
        
        const res = 
        await fetch(`https://www.themealdb.com/api/json/v1/1/${type}.php?${searchOpt}=${userInput}`)
        
        const data = await res.json();
        return data;
    } catch(e) {
        return null;
    }
}

// inputs  - mealID | favourites array from localStorage
// checks for id already exist in localStorage
// to avoid duplicates
const checkFavExists = (id, arr) => {

    // validating input
    if(id === null || arr === null) {
        return false;
    }

    let isExists = arr.filter((i) =>  Number(i.idMeal) === Number(id));
    
    if(isExists === null || isExists.length < 1) {
        return false;
    }

    return true;
}

// adds the Meal Item html code to the div
// checks for the Favourties and search screen 
// and displays content accordingly
const showMealItemElement = (item, isFav) => {
    displayMealsElemet.setAttribute('class','grid grid-cols-3 gap-2 mt-10 space-y-1 w-full')
    for(i of item) {

        displayMealsElemet.insertAdjacentHTML('beforeend',
        `<div 
            class="py-2 px-1 bg-gray-100  rounded-xl 
                    shadow-lg space-y-1 sm:py-2 sm:flex sm:items-center sm:flex-col
                    sm:space-y-0 sm:space-x-6 "
                    md:flex md:items-center md:flex-row
            id=${i.idMeal}
         >
            <img 
                class="block mx-auto rounded-full h-24 sm:mx-0 sm:shrink-0
                        shadow-2xl shadow-slate-900" 
                src=${i.strMealThumb} alt="Meal"
            >

            <div class="text-center space-y-2 sm:text-left">
                <div class="space-y-0.5">
                    <p class="text-lg sm:text-sm  break-word text-black font-semibold">
                    ${i.strMeal}
                    </p>
                    <p class="text-slate-500 font-medium">
                    ${i.strArea}
                    </p>
                </div>
                <div>
                ${isFav ? 
                   ` <button 
                        id=${i.idMeal}
                        class="px-4 antialiased text-xs text-white rounded-sm
                                    bg-gradient-to-r from-slate-500 to-slate-700
                                    font-sans tracking-wide"
                            onclick='removeFromFavourities(${i.idMeal})'
                        >
                            remove
                        </button>`
                    : 
                        `<button 
                            id=${i.idMeal}
                            class="px-4 antialiased text-xs text-white rounded-sm
                                        bg-gradient-to-r from-slate-500 to-slate-700
                                        font-sans tracking-wide"
                                onclick='addToFavourities(${i.idMeal})'
                        >
                            Add to Fav
                        </button>
                        `
                }
                

                <button 
                   class="px-4 antialiased text-xs text-white rounded-sm
                            bg-gradient-to-r from-slate-500 to-slate-700
                            font-sans tracking-wide"
                    onclick='handleInfoClick(${i.idMeal}, ${isFav})'
                >
                    Info
                </button>
                </div>
            </div>
        </div>
        ` )
    } 
}

//Add to favourites functionality
const addToFavourities = async (id) => {
    let data = await fetchFromApi(id, 'i', 'lookup');
    let details = data.meals[0];
    let fav = JSON.parse(localStorage.getItem('FAV'));
    const favouriteList = [];

    if(!fav?.length > 0) {
        favouriteList.push(details);
        localStorage.setItem('FAV', JSON.stringify(favouriteList));
        favouritesCount.textContent = ++favCountFromLocalStorage;
        alert('added to favourites');
        console.log("common");
    } else {
        let favExists = checkFavExists(id, fav);
        if(favExists) {
            console.log('exists');
            console.log(fav);
            alert('already exists in favourites');
            return;
        }
        console.log('not exists');
        fav.push(details);
        localStorage.setItem('FAV', JSON.stringify(fav));
        favouritesCount.textContent = ++favCountFromLocalStorage;
        alert('added to Favourites')
    }
    //localStorage.removeItem('FAV');

    console.log(JSON.parse(localStorage.getItem('FAV')));
}

//Remove from favourities 
const removeFromFavourities = (id) => {

    // getting fav meals from local storage
    let fav = JSON.parse(localStorage.getItem('FAV'));

    if(fav === null || fav.length < 1) {
        return;
    }
    // removing meal from Array
    let filterFavArray = fav.filter((i) => Number(i.idMeal) !== Number(id));
    // storing back in local storage
    localStorage.setItem('FAV', JSON.stringify(filterFavArray));
    // geeting count to display next to fav button
    favCountFromLocalStorage = filterFavArray?.length || 0;
    favouritesCount.textContent = favCountFromLocalStorage;
    //display alert message
    alert('Removed from Favourites')
    if(filterFavArray === null || filterFavArray.length < 1) {
        displayMealsElemet.removeAttribute('class');
        displayMealsElemet.innerHTML = favouriteMessage;    
        return
    }

    //display FAV meals here
    displayMealsElemet.innerHTML = '';
    showMealItemElement(filterFavArray, true);
}

// shows info about the meal Item
const handleInfoClick = async (id, isFav) => {
     let data = await fetchFromApi(id, 'i', 'lookup');
     let details = data.meals[0]; 

     // taking only vedio code from vedio url String
     let youtubeVedioCode = details.strYoutube.split('=')[1]
     displayMealsElemet.removeAttribute('class');
     displayMealsElemet.innerHTML = `<div class="w-full text-center mt-3">
                                        <h1 class="my-2 text-white text-2xl antialiased font-bold underline">${details.strMeal}</h1>
                                        ${isFav ? 
                                            ` <button 
                                                 id=${details.idMeal}
                                                 class="px-4 antialiased text-xs text-white rounded-sm
                                                             bg-gradient-to-r from-slate-500 to-slate-700
                                                             font-sans tracking-wide"
                                                     onclick='removeFromFavourities(${details.idMeal})'
                                                 >
                                                     remove
                                                 </button>`
                                             : 
                                                 `<button 
                                                     id=${details.idMeal}
                                                     class="px-4 antialiased text-xs text-white rounded-sm
                                                                 bg-gradient-to-r from-slate-500 to-slate-700
                                                                 font-sans tracking-wide"
                                                         onclick='addToFavourities(${details.idMeal})'
                                                 >
                                                     Add to Fav
                                                 </button>
                                                 `
                                         }
                                        <img src=${details.strMealThumb} 
                                        class="float-left h-40 m-3  rounded-lg"
                                        >
                                        <p class="mt-10 w-full break-normal text-justify">
                                        ${details.strInstructions}
                                        </p>
                                        
                                        <iframe 
                                        class="w-full aspect-video my-2"
                                        src="https://www.youtube.com/embed/${youtubeVedioCode}"
                                        ></iframe>
                                    </div>`
}

// Get all meals matches the user input
const getMeals = async (value) => {
    isInputFunctionEntered = false;

    let data = await fetchFromApi(value.trim(), 's', 'search');
 
    if(!data?.meals) {
        displayMealsElemet.removeAttribute('class');
        displayMealsElemet.innerHTML = ""
        iSearchresult.innerHTML = `<i class='text-gray text-xs'> Search Result for "${value}" : 0 Results - not found </i>`; 
        setTimeout(() => {iSearchresult.innerHTML="you can search for the meal..!!"}, 2000);   
        return;
    }
    
    searchResults = data.meals;
    displayMealsElemet.innerHTML = '';
    iSearchresult.innerHTML = `<i class='text-gray text-xs'> Search Result for "${value}" : ${searchResults.length} Results </i>`;    

    showMealItemElement(searchResults, false);
}

// Display Favourite Meals Screen
const DisplayFavouritesMeals = () => {
    searchResults = JSON.parse(localStorage.getItem('FAV'));

    if(searchResults === null || searchResults.length < 1) {
        displayMealsElemet.removeAttribute('class');
        displayMealsElemet.innerHTML = favouriteMessage;
        return;
    }

    displayMealsElemet.innerHTML = '';
    showMealItemElement(searchResults, true);
}

// Adding Click Event to Search Button
ButtonSearch.addEventListener('click', function() {
    let searchValue = InputSearch.value;
    if(searchValue === null || searchValue === '') {
        displayMealsElemet.removeAttribute('class');
        displayMealsElemet.innerHTML = "";
        iSearchresult.innerHTML = `<i class='text-gray text-xs'> Search Result for "${searchValue}" : 0 Results - not found </i>`;   
        setTimeout(() => {iSearchresult.innerHTML="you can search for the meal..!!"}, 2000); 
        return;
    }

    getMeals(searchValue);
})

// Adding change event to Search input
InputSearch.addEventListener('input', function(e){
    e.preventDefault();

    // optimising the input search result functionality
    // after user input - wait for 1sec before fetching data
    const searchTimeout = setTimeout(() => getMeals(this.value), 1000);
    
    // clearing searchTimeout if user gives input continously
    // making sure that fetch executes only after user input.
    if(isInputFunctionEntered) {
        clearTimeout(searchTimeout);
    }

    isInputFunctionEntered = true;
})

// Adding click event to favourites button
ButtonFavourites.addEventListener('click', DisplayFavouritesMeals)
