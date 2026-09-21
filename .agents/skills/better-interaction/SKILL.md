---
name: better-interaction
description: Improve interface actions, state transitions, feedback, and motion. Use when behavior is ambiguous, keyboard or assistive access is broken, or animation feels slow, distracting, or disconnected.
---

# Better interaction

Make the next action apparent and its result dependable. Motion is optional; understandable feedback is not.

Read [foundations](../better-interface/references/foundations.md) unless already loaded. If unavailable, report the missing bundle dependency; use only this file's self-contained guidance and do not claim foundations were loaded. Stay within the requested scope. This skill owns behavior, focus, feedback, and timing; copy belongs to better-content and visual contrast to better-style.

## Process

### 1. Map the action and states

Identify the trigger, result, and recovery path. Cover applicable idle, focus, pressed, pending, success, empty, error, and disabled states; do not manufacture irrelevant states. Make pending work distinguishable from completion. Keep entered data when recovery permits and handle repeated activation deliberately.

Protect consequential actions from accidental activation. Prefer reversibility or undo where feasible; use confirmation when the cost and irreversibility warrant interruption, not for every routine action.

Use established platform controls and behavior where possible. Match semantic roles and accessible names to the action. Essential controls must be discoverable without hover. Progressive disclosure hides infrequent complexity, not essential consequences, current status, or recovery.

**Done:** each important action has an understandable result, honest feedback, and a way forward when it fails.

### 2. Make the path accessible

Test the platform's supported keyboard, pointer, touch, and assistive-technology paths as applicable. Focus order follows the task; focus remains visible, unobscured, and appropriately managed when content opens or closes. Modal interactions contain focus appropriately, provide a discoverable exit, and return focus to the initiating or next logical control.

Provide an alternative to precision dragging or complex gestures where applicable. Give controls comfortable targets without changing their apparent visual weight. Follow platform guidance; on the web, distinguish WCAG 2.2 AA's 24×24 CSS-pixel target-size criterion and its exceptions from the useful 44×44 touch-target default.

Associate field errors and instructions with their controls, expose invalid state, and make submission failures discoverable without losing entered values. Better wording alone does not repair an inaccessible error flow.

Surface important status changes through the appropriate accessibility channel without making every update an interruption. Keep transient messages available long enough to understand and act on; essential information or recovery should remain retrievable.

**Done:** the primary task works through the relevant input paths, with no unexplained focus loss, inaccessible essential action, or gesture-only requirement.

### 3. Decide whether motion earns its time

Identify what the interaction accomplishes and how often the person repeats it in a typical session. Motion must help feedback, comprehension, continuity, or expression enough to justify its attention and time. Frequent operational actions and keyboard navigation favor immediate updates; rare actions do not automatically earn animation.

Reuse coherent platform or product motion conventions. Otherwise tune timing to distance, frequency, and purpose in the running artifact. Respond immediately; decorative settling must not block the next action.

Use a fast start with a gentle stop for an entrance, balanced acceleration and deceleration for a visible move, and constant speed only when the motion itself is constant. Anchor movement to its source or destination. Keep scale changes small enough to preserve the object's identity. Motion should clarify the relationship rather than decorate every changing value.

**Done:** every retained animation has a purpose, an appropriate frequency cost, and a reduced-motion alternative. Removing animation is a valid improvement.

### 4. Test continuity and tune in context

Reverse and repeat the interaction before it finishes. The next transition starts from the current visible state, rather than snapping to a stale starting point. Preserve gesture continuity where relevant. Moving decoration must not move a hover or press target out from under the user.

Honor the person's motion preferences through the platform's mechanism: remove nonessential travel, scale, and continuous movement while preserving clear state changes. Use immediate updates or restrained nonspatial feedback as appropriate.

Avoid hazardous flashing independently of motion preferences. Provide pause, stop, or hide controls for persistent automatic movement or updates where required; keep essential live information available without forcing distracting motion.

Apply the foundations' bounded tuning loop to the actual interaction, including repetition and interruption. Remove temporary controls unless requested.

**Done:** test rapid repetition, reversal, reduced motion, failure, and the relevant input paths. Check runtime smoothness on representative hardware when possible; visual inspection of a still image cannot establish motion quality or responsiveness. Report checks not performed.
