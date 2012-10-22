# dirvhost

`dirvhost` is a simple command-line utility that serves all directories from where it's invoked as separate virtual hosts. Host names are dir names with `.local` appended. Port used is 4000.

I find it super useful when having many static web projects going on.

For example if you have a directory `Projects` and in it:

    PS D:\Projects> ls

    Mode                LastWriteTime     Length Name
    ----                -------------     ------ ----
    d----        2012-10-22     11:25            superbigle
    d----        2012-10-22     14:02            szywon

then you'll have `http://superbigle.local:4000` and `http://szywon.local:4000` vhosts configured.

That works best if you have this line in your `/etc/hosts`:

    127.0.0.1 *.local

If your operating system doesn't support wild cards in `hosts` file (as on Windows) I recommend using local DNS proxy like [Acrylic](http://sourceforge.net/projects/acrylic/). Otherwise you have to add each host manually. (On Windows it's usually `C:\Windows\System32\Drivers\etc\hosts`.)

# Installation

Needs [NodeJS](http://nodejs.org). It's best served as a globally visible script, so install it with `-g` (on Windows that doesn't require administrator rights):

    npm install -g dirvhost

# Licence

MIT, See `COPYING` file.
