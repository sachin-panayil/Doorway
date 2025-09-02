## Project Origins

Doorway started with a pretty simple observation: a lot of open source projects need some kind of community support system, but the usual help desk tools are either expensive or way too technical to set up. I wanted something lightweight, free, and built around GitHub’s existing community features — but with a smoother, more approachable interface.

Early on I played around with a few different ideas, from building a full-on GitHub Marketplace app to just handing people repo templates they could configure on their own. Eventually I landed on a middle ground: a repo template powered by GitHub Actions which is a nice balance

## Design Decisions and Trade-offs

One of the core principles was keeping costs at zero and ownership in the hands of users. That meant staying away from things like databases or servers. Instead, data is stored in static JSON files, search runs client-side, and authentication leans on GitHub’s systems. By going the template route, every project owns its own setup instead of relying on a central service. It does mean updates are manual.

## Best Fit

The automation makes setup easier, the interface is more approachable, and communities can present themselves in a way that feels professional and accessible. For projects that care about community building, it’s a solid option.

It’s not the right tool if you need heavy-duty ticketing systems, integrations, or automation. Think of it more as a complement to GitHub.

## The Hard Parts

Of course, there are trade-offs. At the end of the day, Doorway is mostly a prettier, read-only window into GitHub Discussions. If you actually want to reply or participate, you still have to hop over to GitHub, which isn’t the smoothest experience.

The automation also doesn’t save that much time — maybe ten minutes of setup — and users do take on some maintenance when they fork the template. Unlike updating a library through a package manager, keeping your Doorway instance current is more hands-on.

The “split experience” can also be a little awkward. People browse discussions on the Doorway site, then switch over to GitHub to engage. And since the data is static, it can fall behind until the sync workflow runs again.

Finally, while the automation helps, setup still requires some GitHub know-how — forking repos, running workflows, deploying Pages. It’s not rocket science, but it’s also not a one-click install.

Im still in the process of seeing how this can be expanded upon because I believe that the idea is great and is achievable within a minimal cost environment. 
