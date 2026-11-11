# reasoning-engine
An engine to reason about the narratives established using Artha-primitives and validated using the established schema.

Now that I have a schema file that can be used to validate the structure of the established narrative, I can implement the engine that will reason about the narratives to establish its correctness. I will write this in NodeJS and I will use the AJV library to compile the schema and use it to validate the narrative. Using the custom validation flags, I will trigger the reasoning process that will reason about the correctness of the narratives.
