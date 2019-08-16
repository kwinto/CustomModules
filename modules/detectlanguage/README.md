# Detect Language
This module detects the language of the Cognigy input text. It outputs an array of the languages it found, with a score ranging from 0 to 1.

### Function: DETECTLANGUAGE

This is the only function and it detects the language of the input text. The output has the following format:

#### Input text

"Ich bin der Michael"

#### Output JSON

```json 
"language": [
    [
      "german",
      0.452037037037037
    ],
    [
      "dutch",
      0.4318518518518518
    ],
    [
      "welsh",
      0.30240740740740746
    ]
]
``` 

