### Clear workspace
This just clears the existing variables from the workspace.
```
rm(list=ls())
```

### Read in necessary libraries

```
library(lme4)
library(lmerTest)
library(languageR)
library(tidyverse)
```

### Set proper directory
Note: make sure that this actually points to the right file path! It's a bit fragile and hacky...
```
setwd('~/Documents/Research/Linguist_245b/my_project/analysis/01_experiment/rscripts/')
```

### Read in datasets
Just import all the necessary data.

```
sync_data = read.csv('../data/syncopation-trials.csv')
background_data = read.csv('../data/syncopation-background_information.csv')
worker_data = read.csv('../data/syncopation-subject_information.csv')
head(sync_data)
head(background_data)
```

And parse for experimental trials, not attention checks.
```
sync_meas = inner_join(sync_data, background_data, by=c('workerid')) # Add background data by subject
head(sync_meas)
```

# Parse to only real trials, not attention check
test_sync_data = sync_meas[sync_meas$fac1 != -99,]
head(test_sync_data)

# Univariate correlations


# Mixed models
m = lmer(measured_sync ~ fac1 + fac2 + (1|playtime) + (1|listenfreq) + (1|perftime), data = test_sync_data, REML = F)
summary(m)

# Structural equation model