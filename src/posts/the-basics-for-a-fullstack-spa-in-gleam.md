---
title: "The basics for a fullstack SPA in Gleam"
published: 2024/8/03
---

# The basics for a fullstack SPA in Gleam

2024/7/31

Gleam is a functional programming language that, contrary to many other popular functional languages, features a syntax which will feel familiar to those accustomed to C-style programming languges like C#, Javascript, and Rust. This however is where a lot of similarities end for those unfamiliar with functional programming as common constructs like `for` and `while` are missing and replaced with functional recursion while `if` and `switch` have been combined into a more powerful `case`. I won't go any more indepth on the syntax of Gleam in this article but if you're interested i'd recommend checking out the [language tour](https://tour.gleam.run/) for a good starting point.

With that being said this article goes into the stack and libraries used to create a fully [functional fullstack application in Gleam](https://kirakira.keii.dev) however I will not go into any specific details on how the website was made as the code is [available on github](https://github.com/dinkelspiel/kirakira). I will instead explain the basics of routing, ajax requests (fetch), and effects. This article also assumes that you have gone through the tour and know the basics like creating a gleam project and installing libraries as I will not go in to that here.

Before we get into all the code, the entiry codebase for this blogpost is available [on github](https://github.com/dinkelspiel/basic-fullstack-gleam) if you prefer to just look at the code.

## The Frontend

### State

In gleam the current reigning champ for frontend development is hands down the [lustre](https://github.com/lustre-labs/lustre) framework by the amazing [Hayleigh Thompson](https://blog.hayleigh.dev/) that follows the Model-View-Update architecture.

> This means that the state of the application is stored in a single, immutable data structure called the model, and updated as messages are dispatched to the runtime.

Coming from a background of React, this felt quite daunting. I'm used to co-locating my state with the view by using the `const [value, setValue] = useState("")` syntax in React and updating it as simply as `setValue("Hello World")` and moving from this to modelling the state as types, initing the model, then defining messages was quite the ask. Lets see the difference and similarities between these two options.

This is a simple counter as a React component that you've probably seen 100s of times.

```js
function Counter() {
  const [value, setValue] = useState(0);

  return (
    <div>
      <button onClick={() => setValue(value + 1)}>+</button>
      {value}
      <button onClick={() => setValue(value - 1)}>-</button>
    </div>
  );
}
```

and this is the equivalent code in Lustre

```rs
type Model =
  Int

fn init(initial_count: Int) -> Model {
  0
}

pub opaque type Msg {
  Increment
  Decrement
}

fn update(model: Model, msg: Msg) -> Model {
  case msg {
    Increment -> model + 1
    Decrement -> model - 1
  }
}

fn view(model: Model) -> Element(Msg) {
  let count = int.to_string(model)

  div([], [
    button([on_click(Increment)], [text("+")]),
    p([], [
      text(count),
    ]),
    button([on_click(Decrement)], [text("-")]),
  ])
}
```

If we break this down then we first define the model or the "State" for our project. For the counter we only need an integer so we will alias the Model type to an Int but for any project bigger than this you'd want to define a Constructor with named variables like so

```rs
type Model {
  Model(counter: Int, username: String, /* Any other variables here */)
}
```

Then we initalize the state as 0 and define our messages and we only need two effects: Increment and Decrement. These will be what call our updates and is the way you define messages between the html and the update function which is just a simple `case` (similar to a `switch`) over the recieved message. Here we want to add 1 to our model if the `Increment` message is sent and remove 1 from our model if the `Decrement` message is sent.

Then we define our view which returns a Lustre element type which is a Gleam appropriated syntax meant to be similar to html. It should be completely understandeable to anyone atleast somewhat familiar to html. The standouts to what might be considered wierd are the `[]` after the `div`/`p`/`button`, the `text` function and the type in the `on_click`. We will go through them one by one.

First the `[]` after our elements is where we put our attributes. The code I've written doesn't include styling so they look remarkeable empty but if we were to add some classes to our `div` then it might look something like this: `div([class("container")], [])`. Then in the middle we have the function `text` this is simply because Gleam needs explicit types and the `String` type does not convert to the lustre `Element`. Therefor lustre provides the function as a way to add text to the html. Lastly the `on_click` function takes in a `Constructor` of the `Msg` type and it is how lustre handles events. This code will send the `Increment` message to the `update` function when the + button is pressed as an example. This might seem primitive but can be quite powerful when combinding it with data in the constructors so you might send a `Increment(step: 2)` instead of just an `Increment`.

For this small example it is obviosuly more verbose compared to the React example but where this model really starts to shine is when you want to start breaking out components for a larger project than just a counter. In React [prop drilling](https://www.freecodecamp.org/news/avoid-prop-drilling-in-react/) is a common bad practice in React codebases so much so that [entire libraries](https://github.com/pmndrs/zustand) have been made to avoid it. And if you look at some sample zustand code:

```js
const useStore = create((set) => ({
  counter: 0,
  incr: () => set((state) => ({ counter: state.counter + 1 })),
  decr: () => set((state) => ({ counter: state.counter - 1 })),
}));

function Counter() {
  const { counter, incr, decr } = useStore();

  return (
    <div>
      <button onClick={() => incr()}>+</button>
      {counter}
      <button onClick={() => decr()}>-</button>
    </div>
  );
}
```

You might notice that it looks remarkeably like our Lustre example. Lustre promotes a similar state management strategy out of the box allowing [scalability](https://hackernoon.com/scalability-the-lost-level-of-react-state-management) from the start. Defining the messages and models in this way means that any function in our codebase can read from the `model` as long as it is provided in the function by the parent and each function can send out any messages to be handles by a central structure, the `update`.

### Create our app

Now when we've got the state out of the way we want to create our app. Since we are going to have a backend and a frontend we want to create folder for our two projects and then init our two projects inside of there, but we'll start with the frontend.

```bash
$ mkdir my-app # Create our folder
$ cd my-app # Enter the folder
$ gleam new frontend # Create our gleam app named frontend
$ cd frontend # Enter the new frontend project
$ gleam add lustre lustre_dev_tools # Add the lustre and lustre_dev_tools dependencies
```

And before we do anything else we have to go into the `/frontend/gleam.toml` and add `target = "javascript"` below the name and version. It should look something like this:

```toml
name = "frontend"
version = "1.0.0"
target = "javascript"
```

Another thing that is also required is adding a `ffi.mjs` in the `/frontend/src` directory that contains which will be our way of getting the current url of our browser inside the lustre app.

```js
export function get_route() {
  return window.location.pathname;
}
```

Throughout this article you can run the frontend by using

```bash
$ gleam run -m lustre/dev start
```

### Routing

Although state management can go a long way defining different pages is neccesary for a webapp and one thing missing from both Lustre and React is a provided routing strategy. In React this is often solved by using a framework like [Next.JS](https://nextjs.org/) or a routing specific library like [React Router](https://reactrouter.com/en/main). Lustre provides a library called [Modem](https://hexdocs.pm/modem/) which is a simple client-side routing library that provides a router and some wrappers around `window.history.pushState` to allow for routing through Lustres Messages.

To add `modem` to our app we can run the following command in the frontend folder

```bash
$ gleam add modem
```

The Modem library doesn't however provide routing for when the page loads and always defaults to `/` or the default route defined in your init method. This is because Modem only interupts route change messages and the requested route does not send one. It can be implemented rather easily however and below is the simple solution present in https://kirakira.keii.dev. First we define our Route type. Everything in Gleam should be modeled using the type system and that includes our router. Lets create a simple page that has two pages, a landing page and an about page.

```rs
import gleam/uri.{type Uri}
import lustre
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html.{div, text, a, form, input, button}
import lustre/attribute.{href, type_}
import modem

// This is the entrypoint for our app and wont change much
pub fn main() {
  lustre.application(init, update, view)
  |> lustre.start("#app", Nil)
}

// Define our route type
pub type Route {
  Home
  About
  NotFound
}

// Include that route in our model
type Model {
  Model(route: Route)
}

// Define our OnRouteChange message in our messages
pub type Msg {
  OnRouteChange(Route)
  // In gleam we can include data in our types so here we add Route data to our OnRouteChange message
}

// Gleam doesn't expose any functions for getting the current url so we will use the ffi functionality to import this function from javascript later. In laymans terms this makes Gleam be able to import any javascript and use it as a function.
@external(javascript, "./ffi.mjs", "get_route")
fn do_get_route() -> String

// Define our function where we get our route
fn get_route() -> Route {
  let uri = case do_get_route() |> uri.parse {
    Ok(uri) -> uri
    _ -> panic as "Invalid uri"
    // The uri is coming from our javascript integration so an invalid uri should be unreachable state so we can safely panic here
  }

  case uri.path |> uri.path_segments {
    // Here we match for the route in the uri split on the slashes so / becomes [] and /about becomes ["about"] and so on
    [] -> Home
    ["about"] -> About
    _ -> NotFound
  }
}

// Define our function for handling when the route changes
fn on_url_change(uri: Uri) -> Msg {
  OnRouteChange(get_route())
  // When the url changes dispatch the message for when the route changes with the new route that we get from our get_route() function
}

// Create our model initialization
fn init(_) -> #(Model, Effect(Msg)) {
  #(
    Model(
      route: get_route(),
      // Here we can get the current route when the page is initialized in the browser
    ),
    modem.init(on_url_change),
  )
}

// Create our update method
fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    OnRouteChange(route) -> #(
      Model(
        ..model,
        // This isn't neccesary currently but is required to keep the state between the route changes
        route: route,
      ),
      effect.none(),
      // This just tells our program to not do anything after
    )
  }
}

// Now we can define our view with our html
fn view(model: Model) -> Element(Msg) {
  case model.route {
    // Here we match the current route in the state and return different html based on what route is recieved
    Home -> div([], [text("You are on the homepage")])
    About -> div([], [text("You are on the about page")])
    NotFound -> div([], [text("404 Not Found")])
  }
}
```

That is the code neccesary for a router in client-side Gleam. You have to do some scaffolding youself but it gives you much more control. I expect we will see more abstractions come out over the following years like the currently planned work on a framework called [Pevensive](https://github.com/Pevensie/pevensie/discussions/1) which will feature ready-to-use routing among other things similar to a framework like [Laravel](https://laravel.com/).

### Data Fetching

The datafetching in Lustre is mostly done using the [lustre_http](https://hexdocs.pm/lustre_http/index.html) library. It provides a simple function for getting and posting data in lustre Effects and Messages that I've covered previously but adding a simple data fetch to our routing example above to show posts would be to add `Post` type.

First we run

```bash
$ gleam add lustre_http
```

to add `lustre_http` to our dependecies

```rs
pub type Post {
  Post(id: Int, title: String, body: String)
}

// And then if you want to show the data in your state you could add it to your model
type Model {
  Model(
    ..other data
    posts: List(Post)
  )
}
```

Then add a `fn get_posts() -> Effect(msg)` function for getting our data from the api

```rs
import gleam/dynamic
import lustre_http
import gleam/int

fn get_posts() {
  let decoder =
    dynamic.list( // We want to decode a list so we use a dynamic.list here
      dynamic.decode3( // And it is a list of json that looks like this {id: 1, title: "title", body: "body"} so we use a decodeN matching the number of arguments
        Post, // You input the type of your data here
        dynamic.field("id", dynamic.int), // Then here and for the following lines you define the field with the name and the type
        dynamic.field("title", dynamic.string),
        dynamic.field("body", dynamic.string),
      )
    )

  lustre_http.get( // Then you call lustre_http get
    "http://localhost:8000/posts", // This will be a call to our future backend
    lustre_http.expect_json(decoder, GotPosts),  // Then lustre_http exposes a method to parse the resulting data as json that takes in our json decoder from earlier with the Msg that signals that the data was recieved
  )
}
```

this function can then in turn be added into our `Msg` type

```rs
pub type Msg {
  ..other messages
  GotPosts(Result(List(Post), lustre_http.HttpError))
}

// And subsequently our update method
fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ..other messages
    GotPosts(posts_result) -> case posts_result {
      Ok(posts) -> #(Model(..model, posts: posts), effect.none()) // Here we set the state to our current state + our new posts
      Error(_) -> panic
    }
  }
}
```

And to call this function on page start if you are doing something like authentication that shouldn't be done via interaction but instead automatically then you can run this function in your lustre init method.

```rs
fn init(_) -> #(Model, Effect(Msg)) {
  #(
    Model(
      route: get_route(),
      posts: [] // This is our list of posts
    ),
    effect.batch([
      modem.init(on_url_change), // Move the modem.init here inside the new effect.batch
      get_posts(),
    ])
  )
}
```

If we want to now show our posts in our rudamentary frontend fron the rounting section then we can just do this:

```rs
type Route {
  ..other routes
  ShowPost(post_id: Int) // Add a post page that takes in a post_id
}

fn get_route() -> Route {
  let uri = case do_get_route() |> uri.parse {
    Ok(uri) -> uri
    _ -> panic as "Invalid uri"
  }

  case uri.path |> uri.path_segments {
    ..other routes
    ["post", post_id_string] -> {
      let assert Ok(post_id) = int.parse(post_id_string) // Here we parse our post_id from our url and require it to be an int. Ideally in a production application you'd do some error handling here but we only care if it's an integer.
      ShowPost(post_id) // Return the route Post with our post_id
    }
  }
}

fn view(model: Model) -> Element(Msg) {
  case model.route {
    Home -> div([], // If we are on the homepage
      list.map(model.posts, fn(post) { // Loop over all posts in our model
        a([href("/post/" <> int.to_string(post.id))], [ // Return a link to /post/(post_id)
          text(post.title), // With the post title as the link value
        ])
      })
    )
    ShowPost(post_id) -> { // If we are on the post page with a valid post_id
      let assert Ok(post) = list.find(model.posts, fn(post) { post.id == post_id }) // We find the post matching our post_id. Same as the post_id parsing but we only care if the value is valid so we don't care about error handling.

      div([], [ // Show our target post
        text(post.title),
        text(": "),
        text(post.body)
      ])
    }
    About -> div([], [text("You are on the about page")])
    NotFound -> div([], [text("404 Not Found")])
  }
}
```

which will show all posts from our coming backend on our frontend.

And now we can use our model in our view using the `model: Model` variable passed to our view function. This is the bulk of the work that is used to allow a functioning frontend in kirakira. Now if we want to create a post request that adds a post then we can do the following.

#### Creating a post

```rs
import gleam/json
import gleam/option.{type Option}
import lustre/event

type Model { // Update our model
  Model(
    ..previous data
    title: String, // Add title and body to our model. These will be the values we create our post with
    body: String
  )
}

pub type MessageErrorResponse { // Add a new type for our responses that can only have a message or an error
  MessageErrorResponse(message: Option(String), error: Option(String))
}

pub type Msg { // We also update our messages
  ..other messages
  TitleUpdated(value: String) // Add Title and Body updated to handle the input updating in the frontend to sync it with the state of our lustre application
  BodyUpdated(value: String)
  RequestCreatePost // Create a message for our form to create the post
  CreatePostResponded(Result(MessageErrorResponse, lustre_http.HttpError)) // Create a message for when the backend send back a result
}

fn init(_) -> #(Model, Effect(Msg)) { // We update our init function accordingly
  #(
    Model(
      ..previous data
      title: "", // Initalize the title and body to empty string
      body: ""
    ),
    get_posts()
  )
}

fn create_post(model: Model) {
  lustre_http.post(
    "http://localhost:8000/posts", // This will be a call to our future backends create post route
    json.object([
      #("title", json.string(model.title)),
      #("body", json.string(model.body))
    ]),
    lustre_http.expect_json(
      dynamic.decode2(
        MessageErrorResponse,
        dynamic.optional_field("message", dynamic.string),
        dynamic.optional_field("error", dynamic.string),
      ),
      CreatePostResponded
    )
  )
}

fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    ..other messages
    TitleUpdated(value) -> #( // If the user updates the title input
      Model(..model, title: value), // Then we update the current model with the current state and we modify the title to the new value
      effect.none(),
    )
    BodyUpdated(value) -> #( // Same with the body
      Model(..model, body: value),
      effect.none(),
    )
    RequestCreatePost -> #(model, create_post(model)) // Run the create_post function if the RequestCreatePost message was recieved from the frontend.
    CreatePostResponded(response) -> #(model, get_posts()) // If the create post responded then we want to refetch our posts
  }
}

fn view(model: Model) -> Element(Msg) {
  case model.route {
    ..other routes
    Home ->
      div([], list.append([
        form([event.on_submit(RequestCreatePost)], [ // If the user submits the form by clicking on the button we request gleam to create our post
          text("Title"),
          input([event.on_input(TitleUpdated)]), // event.on_input sends the message TitleUpdated each time the user updates the input
          text("Body"),
          input([event.on_input(BodyUpdated)]), // Same here but for BodyUpdated
          button([type_("submit")], [
            text("Create Post")
          ])
        ])
      ],
      list.map(model.posts, fn(post) { // Loop over all posts in our model
        a([href("/post/" <> int.to_string(post.id))], [ // Return a link to /post/(post_id)
          text(post.title), // With the post title as the link value
        ])
      })
    )
  }
}
```

## The Backend

As in most programming languages, interpreted or not, Gleam features an easy to use webserver similar to the likes of [ExpressJS](https://expressjs.com/) and [Go Fiber](https://gofiber.io/) offering a simple and robost way to serve data over the wire and this solution is called [Wisp](https://gleam-wisp.github.io/wisp/). Wisp includes good examples on how you would handle the basics and for most webapps they're really all you need. A backend for a lot of projects will only really need routing, database interfacing, and responding to the incomming request with json. Most of these are covered in their [examples](https://github.com/gleam-wisp/wisp/tree/main/examples) however I will go through how I utalized these in [Kirakira](https://kirakira.keii.dev).

### Creating our backend app

We will do the same spiel so enter the `/my-app` directory (or whatever you called it) and run the following commands.

```bash
$ gleam new backend # Create our gleam app named backend
$ cd backend # Enter the new frontend project
$ gleam add wisp mist gleam_http gleam_erlang simplifile gleam_json cors_builder # Add the lustre and lustre_dev_tools dependencies
```

And create a `data.json` file in `/backend` containing a `[]` to initialize our "database".

### Routing

First we have the routing, arguably the most important part of any backend. Following the routing examples from the examples link above we use the same `app.gleam` with the main method and `/app/web.gleam` as they will not change throughout the project (atleast not until a substantial part if you aren't doing anything wierd).

Here is the `backend.gleam` we will use

```rs
import backend/router
import gleam/erlang/process
import mist
import wisp

pub fn main() {
  wisp.configure_logger()
  let secret_key_base = wisp.random_string(64)

  let assert Ok(_) =
    wisp.mist_handler(router.handle_request, secret_key_base)
    |> mist.new
    |> mist.port(8000)
    |> mist.start_http

  process.sleep_forever()
}
```

and subsequent `/backend/web.gleam`

```rs
import wisp

pub fn middleware(
  req: wisp.Request,
  handle_request: fn(wisp.Request) -> wisp.Response,
) -> wisp.Response {
  let req = wisp.method_override(req)
  use <- wisp.log_request(req)
  use <- wisp.rescue_crashes
  use req <- wisp.handle_head(req)

  handle_request(req)
}
```

The `router.gleam` is also unchanged but we will remove the default route and add a `/posts` route.

```rs
import wisp.{type Request, type Response}
import gleam/string_builder
import gleam/http.{Get, Post as WispPost}
import cors_builder as cors
import backend/web
import gleam/result
import gleam/dynamic
import gleam/json
import gleam/list

pub fn handle_request(req: Request) -> Response {
  use req <- web.middleware(req)

  case wisp.path_segments(req) {
    ["posts"] -> case req.method { // If the user requests the posts route
        Get -> list_posts(req) // And the method is GET, return a list of all posts, we will create this function later
        WispPost -> create_post(req) // And if the method is POST create a post, we will create this function later
        _ -> wisp.method_not_allowed([Get, WispPost]) // And if its neither return an invalid method error
      }
    _ -> wisp.not_found() // If the route is not /posts return a 404 not found
  }
}
```

### Creating our List Post Controller

To handle the route we will create our `controllers` just a fancy word for function that handles a request really. We will start with our `list_posts` function from before.

```rs
type Post { // Create a type that models our post
  Post(id: Int, title: String, body: String)
}

fn list_posts(req: Request) -> Response {
  // Here we will use blocks and use statements and i will explain them more in detail later

  let result = {
    use file_data <- result.try(simplifile.read(from: "./data.json") // To avoid this post getting even *longer* i will use a file as a database. Gleam and databases is for another article. Simplifile is a standard for filesystem usage in Gleam so we use it here
    |> result.replace_error("Problem reading data.json")) // Here we also replace the error with a string so it can be returned later in the error

    // Here we will parse our data from json to a type and then back into json to simulate this coming from a database of some sort but this could really just be a simple returning of the file_data if you wanted to if you are just doing files that map directly to the response.

    let posts_decoder = // Create a decoder that parses a list of posts eg. [{id: 1, title: "Post", body: "Body"}]
      dynamic.list(dynamic.decode3(
        Post,
        dynamic.field("id", dynamic.int),
        dynamic.field("title", dynamic.string),
        dynamic.field("body", dynamic.string)
      ))

    use posts <- result.try(json.decode(from: file_data, using: posts_decoder) // Take our string file_data and turn it into our Post type using our decoder
    |> result.replace_error("Problem decoding file_data to posts"))

    Ok(json.array(posts, fn(post) { // Encode our
      json.object([
        #("id", json.int(post.id)),
        #("title", json.string(post.title)),
        #("body", json.string(post.body))
      ])
    }))
  }

  case result {
    Ok(json) -> wisp.json_response(json |> json.to_string_builder, 200) // Return our json posts that we turn into a string_builder as thats whats required with a code of 200 meaning OK.
    Error(_) -> wisp.unprocessable_entity() // If we encounter an error we send an empty response. If this were a real application it'd probably be best to send a json_response back.
  }
}
```

So what do we do here? Well we use some syntax that might be new to you. We create our result variable and then we open a block. In gleam everything is a statement so you can assign a block with a return to a variable without breaking anything out to a function. Then we have our first problem, the use statement. It has its own [page on the tour](https://tour.gleam.run/advanced-features/use/) that I recommend checking out if you want to learn more but what it effectively does here is taking the [Result](https://tour.gleam.run/data-types/results/) that is returned from a function, here `simplifile.read`. To ignore going into details we then give the result to `result.try` and this makes it so we can do `use` on it. Now we can do our use like so `use file_data <- result.try(simplifile.read(filepath))` which will put the `Ok` value of our simplifile.read into the `file_data` variable or return an `Error` from the block. This is effectively like an early return as we continue if the result is True or exit the block with the Error if it failed.

Then we create our decoder which should be fairly straight-forward. We use the dynamic library to decode a list of an object that has the fields id of type Int, title of type String, and body of type String into the type `List(Post)` because we marked the object to be decoded into the `Post` type. Then we do the same use magic with our json decoder to return an error if it fails or put the parsed List of Posts in our posts variable.

Then we return an `Ok` where we decode the `List(Post)` into json. This has to be surrounded in the `Ok` because of our `use` statements which return `Error` types and we have to comply with the `Result` returntype. And finally we do a `case` on our `result` variable that contains the `Result` type from out block, returning a json response with the status 200 if the `result` variable is `Ok` and an error if the `result` variable from our block is an `Error`.

### Creating our Create Post Controller

Now to handle our `create_post` route we do essentially the same thing.

```rs
// Create a type for our create post request data
type CreatePost {
  CreatePost(title: String, body: String)
}

fn create_post(req: Request) -> Response {
  // We will use the same scaffolding as we use in the list_posts example with our result so that can go unchanged

  // Get the json body from our request
  use body <- wisp.require_json(req)

  let result = {
    // Create a decoder for our request data
    let create_post_decoder = dynamic.decode2(
      CreatePost,
      dynamic.field("title", dynamic.string),
      dynamic.field("body", dynamic.string),
    )

    use parsed_request <- result.try(case create_post_decoder(body) { // Decode our body to the CreatePost type
      Ok(parsed) -> Ok(parsed)
      Error(_) -> Error("Invalid body recieved")
    })

    use file_data <- result.try(simplifile.read(from: "./data.json")) // Load the posts again from the file

    let posts_decoder = // Create a decoder that parses a list of posts eg. [{id: 1, title: "Post", body: "Body"}]
      dynamic.list(dynamic.decode3(
        Post,
        dynamic.field("id", dynamic.int),
        dynamic.field("title", dynamic.string),
        dynamic.field("body", dynamic.string)
      ))

    use posts <- result.try(json.decode(from: file_data, using: posts_decoder)) // Take our string file_data and turn it into our Post type using our decoder

    // Add the new post to the old posts
    let new_posts = list.append(posts, [Post(id: list.length(posts), title: parsed_request.title, body: parsed_request.body)])

    let new_posts_as_json = json.array(new_posts, fn(post) { // Encode our posts to json
      json.object([
        #("id", json.int(post.id)),
        #("title", json.string(post.title)),
        #("body", json.string(post.body))
      ])
    })

    let _ = new_posts_as_json // let _ = syntax just discards the value
    |> json.to_string // Turn the new posts json into a string
    |> simplifile.write(to: "./data.json") // And write it to our data.json file

    Ok("Successfully created post") // Return a success message
  }

  case result {
    Ok(message) -> wisp.json_response(json.object([#("message", json.string(message))]) |> json.to_string_builder, 200) // Return our success
    Error(_) -> wisp.unprocessable_entity() // If we encounter an error we send an empty response. If this were a real application it'd probably be best to send a json_response back.
  }
}
```

And that should be it for our backend. Now if you enter the frontend you should be able to create posts and read them! I'll probably write up an article about database interfacing soon(tm) but for now this is my article on how to create a simple system to post posts between a frontend and a backend in Gleam!

Thank you for reading, and I humbly wish you good night as it's 4:23am <3.
