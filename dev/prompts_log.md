# Prompts Log

## 26-10-01 19:52
install this and create an Android app with a web view from it using Capacitor, so it also runs under iOS; create everything and then I want to open it in Android Studio.

## 26-10-01 20:05
create sensible git commits in between and continue until the app builds with gradlew, and build a unit test that tests whether everything works.

## 26-10-01 20:12
only stop once the app builds properly, and also create a run.sh script that opens the app as a webapp in the browser.

## 26-10-01 20:18
also create a mobile-build.sh script that prepares the app so it can be opened in Android Studio.

## 26-10-02
link the original repo and explain how this repo was forked from it — apparently no files are identical.

## 26-10-02
shouldn't the original Primordium also be added as a remote and linked in the README?

## 26-10-02
ok, staying with the name Primordium. The built-in manual should be extracted as How_to_play.md into the repo and linked in the README.

## 26-10-02
in How_to_play.md intro: explain how the simulation works and what is special about it; the Squirm3 reference is pointless since visitors do not know it.

## 26-10-02
add a German How_to_play_de.md file.

## 26-10-02
search online for a simple explanation of Squirm3.

## 26-10-02 03:25
rename primordium to Evoloom.

## 26-10-02 03:35
The manual is not really a tutorial. Build a tutorial button that explains everything step by step and walks through different examples. Use Playwright to complete it.

## 26-10-02 03:40
continue.

## 26-10-02 04:10
The tutorial should not only explain everything, but also let the user
complete specific tasks on the playfield themselves; it should only
continue once the correct action has been performed — a guided tutorial
that explains the game, at the end you can play it.

## 26-10-02 04:35
The 'a' atoms have no color or are transparent — you can only tell they
must be there because the bond lines have a kink at that spot. Is that
intended? If not, make sure they get an unambiguous color.

## 26-10-02 04:50
The 'a' atom needs a different color: yellow, styled exactly like the
other letters b, c, d, e, f and the same size — it is currently smaller
than the other letters.

## 26-10-02 05:00
Now I get it — the 'a' atoms are the membranes around the "cells"; it
looks best when they are not balls at all. Let's see how it looks with
very small dots in the same color as the bonds.

## 26-10-03 00:40
In the tutorial, the first step "open the menu bar" is always fulfilled
immediately and is unnecessary anyway — opening the menu bar is nothing
one needs to learn separately.

## 26-10-03 01:10
Tutorial step "Genome copying & division": nothing happens, since a new
game has no food/free polymerase near the pasted cell — or am I seeing
that wrong?

## 26-10-03 01:35
In the tutorial the inspect step moves on too fast — the 'i' window
closes itself immediately; the user should be asked to close it with
the right button or Esc or whatever is needed.

## 26-10-03 02:00
Select atom must also be switchable off, otherwise you can't drag —
explain that in the tutorial. Also, when an atom was selected and the
cell gets dropped, make sure no atom of an existing cell is selected
initially — otherwise the new cell drops right into the other cell.

## 26-10-03 02:30
You can zoom out way too far — the limit should be where the arena
fills the full height or width depending on window orientation,
never leaving white space outside the box in both dimensions; at
maximum zoom-out it should center.

## 26-10-03 03:15
First build the camera-follow mode (step 1), commit it, then plan the
tutorial-follow mode (step 2) — ideally with an explanation of how to
switch it on yourself (in paused mode).

## 26-10-03 03:45
When nothing is selected the Follow button must be greyed out, and
the button must sit next to the Select button. Change that, then
commit it yourself, then update the plan with only the current todo.

## 26-10-03 04:00
Implement step 2 (tutorial integration: paste selects the drop,
interior soup in the demo cell, zoom + pause + camera follow on the
protocell step, follow explainer step).

## 26-10-03 04:30
The tutorial window must be slightly transparent.

## 26-10-03 04:45
The "camera follows" step must be a task so the user switches Follow
on themselves before the tour continues. Also the selected-atom
circles look messy — make the selection rings thinner and
semi-transparent.

## 26-10-03 05:10
The info popup and the tutorial popup must both switch to the
topmost z layer when clicked.

## 26-10-03 05:30
The tutorial window sinks too far into the background — it may only
land one layer below the info popup, but right now it ends up under
the game layer.

## 26-10-03 05:50
Better, but there is still a blur layer beneath the info popup that
sits above the tutorial popup. When the tutorial moves behind the
info popup, the blur layer must be below the tutorial popup.

## 26-10-03 06:20
Add a shortcut S for Select on/off if there isn't an S shortcut yet.

## 26-10-03 06:40
Zooming in and out with the mouse wheel is much too fast — make it
slower.

## 26-10-03 07:05
In the bottom shortcuts list, remove all shortcuts that already sit on
the buttons. When the game is started, WASD steering must be explained
at the bottom (hidden again when the game ends). The new S shortcut on
the Select button must also be hidden while the game is running.
