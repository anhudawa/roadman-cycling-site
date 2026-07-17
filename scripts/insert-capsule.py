#!/usr/bin/env python3
"""Insert answerCapsule into MDX frontmatter before keyTakeaways."""
import sys
import re
import textwrap

def insert_capsule(filepath, capsule_text):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'answerCapsule' in content:
        print(f"SKIP: {filepath} already has answerCapsule")
        return False
    
    # Find the frontmatter boundaries
    parts = content.split('---', 2)
    if len(parts) < 3:
        print(f"ERROR: {filepath} has no valid frontmatter")
        return False
    
    frontmatter = parts[1]
    body = parts[2]
    
    # Wrap the capsule text for YAML
    lines = textwrap.wrap(capsule_text.strip(), width=78)
    capsule_yaml = "answerCapsule: >-\n" + "\n".join(f"  {line}" for line in lines)
    
    # Try to insert before keyTakeaways
    if '\nkeyTakeaways:' in frontmatter:
        frontmatter = frontmatter.replace('\nkeyTakeaways:', f'\n{capsule_yaml}\nkeyTakeaways:')
    elif '\nrelatedPosts:' in frontmatter:
        frontmatter = frontmatter.replace('\nrelatedPosts:', f'\n{capsule_yaml}\nrelatedPosts:')
    else:
        # Add at end of frontmatter
        frontmatter = frontmatter.rstrip() + f'\n{capsule_yaml}\n'
    
    new_content = f'---{frontmatter}---{body}'
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"OK: {filepath}")
    return True

if __name__ == '__main__':
    filepath = sys.argv[1]
    capsule = sys.argv[2]
    insert_capsule(filepath, capsule)
