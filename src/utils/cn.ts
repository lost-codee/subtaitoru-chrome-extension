/**
 * Combine multiple class names into a single string, ignoring any falsy values.
 *
 * @example
 * combineClasses("foo", "bar", undefined, "baz") // "foo bar baz"
 * @param {...string} classes - The class names to combine
 * @returns {string} The combined class names
 */

export function cn(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}
