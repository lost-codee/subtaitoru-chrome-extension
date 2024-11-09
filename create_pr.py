import os
import sys
import openai
import json
import subprocess
from datetime import datetime

# Setup OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

def get_repository_structure():
    """Get the repository file structure"""
    result = subprocess.run(['git', 'ls-files'], capture_output=True, text=True)
    return result.stdout.strip().split('\n')

def create_branch():
    """Create a new branch for the changes"""
    branch_name = f"ai-fix-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    subprocess.run(['git', 'checkout', '-b', branch_name])
    return branch_name

def commit_and_push(branch_name):
    """Commit and push changes"""
    subprocess.run(['git', 'config', '--global', 'user.email', 'github-actions[bot]@users.noreply.github.com'])
    subprocess.run(['git', 'config', '--global', 'user.name', 'github-actions[bot]'])
    subprocess.run(['git', 'add', '.'])
    subprocess.run(['git', 'commit', '-m', f"AI-suggested changes for issue #{issue_number}"])
    subprocess.run(['git', 'push', 'origin', branch_name])

def create_pull_request(branch_name):
    """Create a pull request using gh CLI"""
    pr_title = f"AI Fix: {issue_title}"
    pr_body = f"Addresses issue #{issue_number}\n\nAutomatically generated fix for the issue."
    
    subprocess.run([
        'gh', 'pr', 'create',
        '--title', pr_title,
        '--body', pr_body,
        '--base', 'main',
        '--head', branch_name
    ])

def get_ai_suggestions():
    """Get suggestions from OpenAI"""
    files = get_repository_structure()
    files_str = "\n".join(files)
    
    response = openai.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful AI assistant that suggests code changes. Provide specific file changes needed to resolve the issue."},
            {"role": "user", "content": f"""
            Repository structure:
            {files_str}
            
            Issue Title: {issue_title}
            Issue Description: {issue_body}
            
            Provide the specific files that need to be modified and their changes.
            Format your response as a JSON object with file paths as keys and their new content as values.
            Only include files that need to be modified."""}
        ]
    )
    
    try:
        # Extract the JSON from the response
        suggestion = response.choices[0].message.content
        print(suggestion)
        # Find the JSON part (between first { and last })
        json_start = suggestion.find('{')
        json_end = suggestion.rfind('}') + 1
        if json_start != -1 and json_end != 0:
            suggestion = suggestion[json_start:json_end]
        return json.loads(suggestion)
    except json.JSONDecodeError:
        print("Error: AI response was not in valid JSON format")
        return {}

# Get issue details from environment
event_path = os.getenv('GITHUB_EVENT_PATH')
with open(event_path, 'r') as f:
    event_data = json.load(f)

issue_title = event_data['issue']['title']
issue_body = event_data['issue']['body']
issue_number = event_data['issue']['number']

# Get AI suggestions
changes = get_ai_suggestions()

if not changes:
    print("No changes suggested by AI")
    sys.exit(1)

# Create new branch
branch_name = create_branch()

# Apply changes
for file_path, new_content in changes.items():
    print(f"File Path: {file_path}")
    print(f"New Content: {new_content}")
    # Ensure directory exists
    if file_path and os.path.dirname(file_path):
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, 'w') as f:
        f.write(new_content)

# Commit and push changes
commit_and_push(branch_name)

# Create pull request
create_pull_request(branch_name)
