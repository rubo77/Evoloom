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

## 26-10-03 07:30
Commit this, then work through all points in the TODO: mobile canvas
full width, right menu not showing fully, hide all shortcuts on
mobile, hamburger without "Controls", hide fullscreen and tutorial
buttons outside the menu, and a hide/show option for the top-left
overlay with a small arrow button. Commit in between each.

## 26-10-04 03:30
Is the mobile-check.js script even useful? If it can go, delete it.
On wide screens whose height is under 850px the page starts scrolling
vertically — that must not happen; when shrinking the window height the
canvas must get narrower so everything still fits. The canvas must also
always be flush with the top-left screen edge, leaving a margin on the
right/bottom instead, and that margin outside the canvas must be gray,
not white.

## 26-10-04 03:40
Clarification: this is only about how the arena is centered when fully
zoomed out — it must be aligned to the top-left, that is all that needs
to change. And only the area outside the arena *within the canvas*
should be gray instead of white.

## 26-10-04 04:05
On wide screens with a height under 850px the whole HTML page starts
scrolling vertically — that must not happen. The canvas seems to have
a minimum height; it must be much smaller, ~100px or so.

## 26-10-04 04:35
That's not a good solution — the sim screen should always use the full
width, even at low heights.

## 26-10-04 05:20
The snap at the end when fully zoomed out should ease over 0.5s.

## 26-10-04 05:50
In camera follow mode the camera shouldn't jitter — it should only
update the position every 0.5s with a 0.5s ease.

## 26-10-04 08:40
Zooming in and out always turns follow off — that must not happen.

## 26-10-04 09:10
When the game starts, one atom in the new green controllable cell must
be auto-selected and follow switched on. The follow toggle gets the F
shortcut, so freeze needs another one — why is it called "freeze"
anyway? Suggest a free, fitting shortcut.

## 26-10-04 11:10
Something changed — I keep dying very fast now, after ~20s or so,
varies, "all your cells were lysed".

## 26-10-04 11:40
When toggling states, the menu buttons must show the new states, also
when restoring after the game. Right now e.g. the hydrolysis button
stays active when starting a game although it is actually off.

## 26-10-04 12:05
- At the collapsible stats/legend HUD with corner toggle: the small
  </> arrow in the top-left corner should be inside the upper square
  on the right, when the stats are visible.
- The help texts that appear at the bottom when pressing a button
  should already appear on mouseover and disappear again — the text
  that was there before must be remembered. The help texts should
  also appear on long-touch on mobile.

## 26-10-04 12:35
The HUD toggle is too dark — it should have the same color and
transparency as when collapsed. Also the left padding before the
"free" value is too large; the upper box should be at most as wide
as the legend below (unless the text no longer fits because the
numbers get too large).

## 26-10-04 12:55
The minimize button must be left-aligned inside the upper box, next
to the text.

## 26-10-04 13:10
"Fast forward the simulation" does not work — it hangs at "Cancel
0%", even with only 1000 steps it either takes forever or just does
not show progress and stays at 0%. Fix it and also build in two
decimal places in the percent display.


## 26-10-04 14:05
Pressing "reset simulation" during a burn must abort the burn.

## 26-10-04 14:25
Instead of "cancel" it should say "stop", since the state before the
burn is not restored — it just stops at the point in the burn where
you currently are.

## 26-10-04 14:45
The burn default should be 1000 when the app starts.

## 26-10-04 15:30
Apparently the burn is not faster at all than letting the simulation
run visibly. Optimize that if possible; analyze what could be left out
during burn that normally always runs.

## 26-10-04 16:40
A fixed step of 100 or 1000 is not sensible for the burn-iters input;
the spinner should instead add/subtract a tenth of the current order
of magnitude. The default step warning is also wrong ("please select
a valid value...").

## 26-10-04 17:10
The snap is still not right: pressing up goes from 31000 to 31100 and
only on the next click it snaps to 32000.

## 26-10-04 17:40
Is the burn mode actually faster than the visible simulation now? It
does not seem so — is it even possible to simulate faster without
visibility, or is the display marginal in comparison? In that case the
whole burn block can be hidden for now.

## 26-10-04 17:55
Fix the error: when the address is already in use, stop the server
with kill first.

## 26-10-04 18:05
The physics speed block should also show a help text at the bottom,
and long-press too (DRY) — for speed, soup, damp.

## 26-10-04 18:25
Speed makes no sense at all, does it? Because then everything just
stutters.

## 26-10-04 18:55
What would be useful is slowing everything down — that is what I
imagine under "speed". What does the tutorial step do? Is that
nonsense too?

## 26-10-04 19:20
What are damp and soup for? Explain more precisely and improve the
hint texts; analyze what the effect in the code actually does.
## 26-10-04 20:40
The dictionary in the chemistry editor explains the genes really well
— that should go into the tutorial, instructing the user to open it via
a new menu block containing a new button that opens the chemistry
editor popup but defaults to the dictionary tab. The chemistry editor
button stays under Labs and opens the editor by default since the
editor is only for very experienced users. Also move the tutorial
button into the new block and shift the play mode block up above
physics. Plan first.
## 26-10-05 08:15
Quicksave and quickload need different keyboard shortcuts that also
work well on QWERTZ. Also link the online version on eclabs in the
README.

## 26-10-04 14:00
Why is the pause button hidden once the game has started? And the WASD
steering doesn't work — instead it should be: when no tool is selected,
you can just press anywhere on the screen and the green bacterium moves
toward where you press for as long as you hold.

## 26-10-04 21:05
When the game starts, the top-left HUD must change completely: it must
show how many enemies / enemy elements there are and how big the player
has grown. Analyze exactly what the win conditions are and how close one
is to the goal or to death.

## 26-10-04 22:10
The game-mode HUD shows the enemy count twice, that makes no sense.
Better to show only the remaining player membrane as a danger
indicator instead of the atom count — or does showing both make
sense? Also: is the plan in dev/evoloom-game-logic-and-hud-plan.md
correct, and which parts are already implemented? Add (DONE) markers
to what is done.

## 26-10-05 10:20
On the phone you cannot close the menu again because the phone's
status bar covers the X. Add a true fullscreen in the manifest —
model it on the fullscreen setting in Lalumo in /var/www/Musici,
where I solved it correctly.

## 26-10-05 08:10
Can you read the copilot reviews in the PR? Adjust the branch with
all of copilot's findings, using the titles he used (e.g.
"Instrumented test asserts the wrong application package ID") as
individual commits, if you find the suggestions sensible — do not
believe copilot blindly.

26-10-07 — "Where is the term 'dart' used in the display? I want a different
term shown to the user, e.g. phage or spore or Lysovirus — what would fit
well? List all interface texts containing dart." → chose 'lysovirus', plus:
line break after READY in the HUD weapon readout; make the 'out' count
self-explanatory; asked why the dart spawns so far from the cell — spawn
should sit directly outside the membrane along the fire direction instead
of beyond the cell's widest radius.
