#  🎪 amìco-fe
is a FOSS virtual world focusing on streaming video booths for events

# Related Repos
- [amìco-fe](https://github.com/stagfoo/amico-fe)
- [amìco-be](https://github.com/stagfoo/amico-be)

# Repo relationship
[amìco-fe](https://github.com/stagfoo/amico-fe) will run on its own without sockets as a single player so backend is not required for all single player feature/UI.

If you build [amìco-fe](https://github.com/stagfoo/amico-fe) it will be pasted into the `public` folder in the [amìco-be](https://github.com/stagfoo/amico-be) repo


## Planned features
- more peep(the characters)
- time limited chat
- emoji reactions (kinda like animal crossing)
- sound management for videos in game
- floating dashjs videos 
- dashjs video from youtube


## peeps
there are a few other project focused on random characters
I think peep can also be similar to [dicebear](https://github.com/darosh/gridy-avatars)

# Inspirations

I saw a virtual summit this year and while it and i love animal crossing so i wanted to make a simple virtual space for everyone.

![](docs/inspire/summit.jpeg)

## Why not VR
people dont have the hardware and its not simple yet
maybe when its common but I think its better to target more devices, 
older devices then VR and high end devices.

# Rewrite from Godot
currently godot doesnt support any sort of html embeding like dash videos or hsl videos so i had to rewrite it in a more web friendly setup.

![](docs/old-godot-1.png)
![](docs/old-godot-2.png)
