# How to run

From the root directory run:
```
npm run start
```

#### In case of errors

If app fails with some error related to missing lib, missing dependecy, run:
```
npm install
```

# How to keep your branch up-to-date

Ensure you are in your local branch and has nothing to be commited:
```
git status
```
If there is something to be commited, do it.


Change to master branch:
```
git checkout master
```

Update your local master branch:
```
git pull
```

Move back to your branch:
```
git checkout lara
```

Get the updates from master and apply them to your branch:
```
git merge master
```
