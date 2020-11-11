// Creating references to several crucial HTML Elements
// 
// let image = document.querySelector(".collection-card-image")
const collectionsList = document.querySelector("#collections-list")
const storyboard = document.querySelector("#storyboard")
let globalCollectionID = 0
const createStoryForm = document.querySelector(".create-story-form")


// Initializing Chart.js Doughnut Chart through HTML Canvas
let canvas = document.getElementById('doughnutChart')
let ctx = canvas.getContext('2d')
ctx.clearRect(0, 0, canvas.width, canvas.height)
const defaultChartData = [0, 0, 0, 0, 0, 0, 0, 0]
const doughnutChart = new Chart(ctx, 
{
    type: 'doughnut',
    data: 
    {
        labels: ['Angry', 'Hungry', 'Happy', 'Ambitious', 'Brooding', 'Sad', 'Playful', 'Stoic'],
        datasets: [
        {
            label: 'Moods',
            data: [...defaultChartData],
            backgroundColor: 
            [
                'rgba(220, 20, 60, 0.3)',
                'rgba(255, 127, 80, 0.3)',
                'rgba(255, 228, 181, 0.3)',
                'rgba(0, 250, 154, 0.3)',
                'rgba(0, 255, 255, 0.3)',
                'rgba(100, 149, 237, 0.3)',
                'rgba(138, 43, 226, 0.3)',
                'rgba(255, 105, 180, 0.3)'
            ],
            borderColor: 
            [
                'rgba(220, 20, 60, 1)',
                'rgba(255, 127, 80, 1)',
                'rgba(255, 228, 181, 1)',
                'rgba(0, 250, 154, 1)',
                'rgba(0, 255, 255, 1)',
                'rgba(100, 149, 237, 1)',
                'rgba(138, 43, 226, 1)',
                'rgba(255, 105, 180, 1)'
            ],
            borderWidth: 1
        }]
    }
})


// Logic for handling Story submissions
createStoryForm.addEventListener("submit", (e) => 
{

    e.preventDefault()

    let storyContent = document.querySelector(".story-content-input").value
    let mood = document.querySelector(".mood-select").value
    let moodRating = document.querySelector(".mood-rating-select").value
    let photoURL = document.querySelector(".photo-url-input").value
    let collectionID = globalCollectionID

    fetch('http://localhost:3000/stories', 
    {

        method: "POST",
        headers: 
        {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(
        {
            content: storyContent,
            mood: mood, 
            mood_rating: moodRating,
            photo_url: photoURL,
            collection_id: collectionID
        })

    })
    .then(res => res.json())
    .then((story) => 
    {
        renderCollectionStory(story)
        getCollectionMoods()
    })

})

// Logic for retrieving all Stories from currently selected Collection
function getCollectionStories(collection)
{

    fetch("http://localhost:3000/stories")
    .then(res => res.json())
    .then((stories) => 
    {
        
        storyboard.innerHTML = null
        stories.forEach((story) => 
        {

            if(story.collection_id === collection.id)
            {
                renderCollectionStory(story)
            }
            
        })

    })

}

function renderCollectionStory(story)
{

    let content = story.content
    let mood = story.mood.toLowerCase()
    let moodRating = story.mood_rating
    let photoURL = story.photo_url

    const colorMap = 
    {
        angry: "red",
        hungry: "orange",
        happy: "yellow",
        ambitious: "green",
        brooding: "teal",
        sad: "blue",
        playful: "purple",
        stoic: "pink"
    }

    let color = colorMap[mood]

    let collectionCard = document.createElement("div")
    collectionCard.className = `collection-card hover:bg-${color}-${moodRating}00`

    let collectionCardImageContainer = document.createElement("div")
    collectionCardImageContainer.className = "collection-card-image-container"
    let collectionCardImage = document.createElement("div")
    collectionCardImage.className ="collection-card-image"
    collectionCardImage.style.backgroundImage = `url(${photoURL})`
    collectionCardImageContainer.append(collectionCardImage)
    
    let divider = document.createElement("hr")
    divider.className = "divider"

    let extrasContainer = document.createElement("div")
    extrasContainer.className = "extras-container flex flex-row justify-around"
    let moodDiv = document.createElement("div")
    moodDiv.className = "p-2"
    let moodSpan = document.createElement("span")
    moodSpan.innerText = mood 
    let moodRatingSpan = document.createElement("span")
    moodRatingSpan.innerText = moodRating
    moodDiv.append(moodSpan, " - ", moodRatingSpan)
    // let deleteDiv = document.createElement("div")
    // deleteDiv.className = "delete-div p-2 bg-indigo-700 rounded text-white"
    // deleteDiv.innerText = "Delete"
    let updateButton = document.createElement("button")
    updateButton.innerText ="Reverse"
    
    extrasContainer.append(moodDiv, updateButton) //, deleteDiv)

    let divider2 = document.createElement("hr")
    divider2.className = "divider"

    let collectionCardBody = document.createElement("div")
    collectionCardBody.className = "collection-card-body p-4"
    collectionCardBody.innerText = content

    updateButton.addEventListener("click", () => 
    {

        fetch(`http:localhost:3000/stories/${story.id}`, 
        {
            method: "PATCH",
            headers: 
            {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(
            {
                content: content.split("").reverse().join("")
            })
        })
        .then(res => res.json())
        .then((newStory) => 
        {
            collectionCardBody.innerText = newStory.content
            content = newStory.content
        })

    })

    collectionCard.append(collectionCardImageContainer, divider, extrasContainer, divider2, collectionCardBody)
    storyboard.append(collectionCard)
    imageOrientation(collectionCardImage, collectionCardImageContainer)

}

function renderCollection(collection)
{

    let name = collection.name
    let id = collection.id

    let collectionIntroName = document.querySelector('#collection-intro-name')
    let collectionIntroDescription = document.querySelector('#collection-intro-description')
    let collectionDiv = document.createElement("div")
    collectionDiv.innerText = name
    collectionDiv.className = "h-1/4 w-full hover:text-white hover:bg-indigo-700 py-1 text-center"
    let collectionDelete = document.createElement("span")
    collectionDelete.innerText = " x "

    collectionDiv.addEventListener("click", (e) => 
    {
        collectionIntroName.innerText = collection.name
        collectionIntroDescription.innerText = collection.description
        getCollectionStories(collection)
        globalCollectionID = id
        if (e.target !== collectionDelete)
        {
            getCollectionMoods()
        }
    })

    collectionDelete.addEventListener("click", () => 
    {

        let ans = confirm("Are you sure you want to delete this collection?")

        if(ans)
        {

            updateChart([...defaultChartData])

            fetch(`http://localhost:3000/collections/${id}`, 
            {
                method: "DELETE"
            })
            .then(() => 
            {
                collectionDiv.remove()
                collectionIntroName.innerText = null
                collectionIntroDescription.innerText = null
                if(globalCollectionID === id)
                {
                    storyboard.innerHTML = null
                }
            })

        }

    })
    collectionDiv.append(collectionDelete)

    collectionsList.append(collectionDiv)

}

function getAllCollections()
{

    fetch('http://localhost:3000/collections')
    .then(res => res.json())
    .then((collections) => 
    {
        collections.forEach((collection) => 
        {
            renderCollection(collection)
        })
    })

}

function getCollectionMoods()
{

    let moodCounts = 
    {
        angry: 0,
        hungry: 0,
        happy: 0,
        ambitious: 0,
        brooding: 0,
        sad: 0,
        playful: 0,
        stoic: 0
    }

    fetch('http://localhost:3000/stories', 
    {
        method: "GET"
    })
    .then(res => res.json())
    .then((stories) => 
    {

        stories.forEach((story) => 
        {

            if(story.collection_id === globalCollectionID)
            {
                moodCounts[story.mood.toLowerCase()] += 1
            }

        })

        let {angry, hungry, happy, ambitious, brooding, sad, playful, stoic} = moodCounts
        let newChartData = [angry, hungry, happy, ambitious, brooding, sad, playful, stoic]
        updateChart(newChartData)

    })

}

function updateChart(newData)
{
    doughnutChart.data.datasets[0].data.splice(0, 8, ...newData)
    doughnutChart.update()
}

window.addEventListener("DOMContentLoaded", () => 
{

    getAllCollections()

    const collectionNameInput = document.querySelector('#collection-name-input')
    const collectionDescriptionInput = document.querySelector('#collection-description-input')
    const collectionForm = document.querySelector('#collection-form')
    collectionForm.addEventListener("submit", (e) => 
    {

        e.preventDefault()

        let collectionName = collectionNameInput.value
        let collectionDescription = collectionDescriptionInput.value

        fetch('http://localhost:3000/collections', 
        {

            method: "POST",
            headers: 
            {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(
            {
                name: collectionName,
                description: collectionDescription
            })

        })
        .then(res => res.json())
        .then((collection) => 
        {
            renderCollection(collection)
        })

    })

})



function picStats(pic)
{

    let height = pic.naturalHeight
    let width = pic.naturalWidth
    const aspectRatio = width / height
    
    return aspectRatio

}

function imageOrientation(image, container) 
{

    let source = window.getComputedStyle(image, false).backgroundImage.slice(4, -1).replace(/"/g, "")
    let pic = document.createElement("img")
    pic.src = source
    pic.addEventListener("load", () => 
    {

        let ratio = picStats(pic)

        if(ratio > 1) // If image is landscape
        {
            console.log('landscape')
            image.style.backgroundSize = "cover"
            container.style.padding = "8px"
        }
        else if(ratio < 1) // If image is portrait
        {
            console.log('portrait')
            image.style.backgroundSize = "contain"
            container.style.padding = "16px 9px"
        }
        else // Otherwise, image is square
        {
            console.log('square or not hitting')
            image.style.backgroundSize = "contain"
            container.style.padding = "8px"
        }

        delete pic

    })

}