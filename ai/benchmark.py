import requests

# Define the endpoint URL for your Supabase edge function
SUPABASE_EDGE_FUNCTION_URL = "https://qpummxvizckytrrsiaig.supabase.co/functions/v1/gemini"
AUTHORIZATION_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdW1teHZpemNreXRycnNpYWlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI1NjgzMDgsImV4cCI6MjAyODE0NDMwOH0.DYJIU3x0pd5Ub6PDz1vlJCs07O9WFIXokQLD0By8HbQ"

# Define the test cases: each test case is a tuple of (expense_title, expected_category)
test_cases = {
    'ai_generated': [
        # generic english ai generated
        ("Buy new shoes", "Shopping"),
        ("Weekly groceries", "Groceries"),
        ("Dinner at restaurant", "Dining Out"),
        ("Monthly rent", "Home & Utilities"),
        ("Flight to Paris", "Travel"),
        ("Gas refill", "Car & Transportation"),
        ("Concert tickets", "Concerts & Events"),
        ("New smartphone", "Electronics & Gadgets"),
        ("Fishing gear", "Hobbies & Leisure"),
        ("Netflix subscription", "Entertainment"),
        ("Gym membership", "Health & Fitness"),
        ("Haircut", "Personal Care"),
        ("Online course", "Education"),
        ("Charity donation", "Gifts & Donations"),
        ("Miscellaneous expense", "Other"),
    ],
    'human_generated': [
        ("Supermarché", "Groceries"),
        ("Kebab", "Dining Out"),
        ("Saint cyr la fete", "Concerts & Events"),
        ("Boulangerie Dejeuner", "Dining Out"),
        ("Hotel saint cyr pizza", "Dining Out"),
        ("Au bureau", "Dining Out"),
        ("Picard", "Groceries"),
        ("Lidl", "Groceries"),
        ("Raquette+balles", "Hobbies & Leisure"),
        ("Trianon", "Other"),
        ("Kebab tacos", "Dining Out"),
        ("Nouveau Resto", "Dining Out"),
    ]
}

def call_supabase_function(expense_title):
    headers = {
        'Authorization': f'Bearer {AUTHORIZATION_TOKEN}',
        'Content-Type': 'application/json'
    }
    data = {"title": expense_title}
    response = requests.post(SUPABASE_EDGE_FUNCTION_URL, json=data, headers=headers)
    response_data = response.json()
    return response_data.get("name")

def benchmark():
    for data_source, data in test_cases.items():
        correct_count = 0
        print(f"Data type: {data_source}")
        for expense_title, expected_category in data:
            predicted_category = call_supabase_function(expense_title)
            is_correct = predicted_category == expected_category
            print(f"Title: '{expense_title}' | Expected: '{expected_category}' | Predicted: '{predicted_category}' | Correct: {is_correct}")
            if is_correct:
                correct_count += 1
        total_cases = len(data)
        accuracy = (correct_count / total_cases) * 100
        print(f"\nAccuracy on {data_source}: {accuracy}%")

# Run the benchmark
benchmark()
