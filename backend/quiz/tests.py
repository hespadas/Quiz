from django.contrib.auth.models import User
from django.test import TestCase

from quiz.models.category import Category
from quiz.models.option import Option
from quiz.models.question import Question
from quiz.models.quiz import Quiz


class CategoryModelTest(TestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Science")

    def test_category_creation(self):
        assert self.category.name == "Science", "Category name should be 'Science'"
        assert isinstance(self.category, Category), "category should be an instance of Category"
        assert str(self.category) == "Science", "String representation should be 'Science'"


class QuizModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.category = Category.objects.create(name="Literature")
        self.quiz = Quiz.objects.create(
            title="Classic Literature Quiz",
            description="A quiz on classic literature.",
            category=self.category,
            created_by=self.user
        )

    def test_quiz_creation(self):
        assert self.quiz.title == "Classic Literature Quiz", "Quiz title mismatch"
        assert self.quiz.description == "A quiz on classic literature.", "Quiz description mismatch"
        assert self.quiz.category == self.category, "Quiz category mismatch"
        assert self.quiz.created_by == self.user, "Quiz created_by mismatch"
        assert isinstance(self.quiz, Quiz), "quiz should be an instance of Quiz"
        assert str(self.quiz) == "Classic Literature Quiz", "String representation mismatch"


class QuestionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.category = Category.objects.create(name="History")
        self.quiz = Quiz.objects.create(
            title="World History Quiz",
            description="A quiz on world history.",
            category=self.category,
            created_by=self.user
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="Who was the first President of the United States?",
            order=1,
            question_type="MC"
        )

    def test_question_creation(self):
        assert self.question.text == "Who was the first President of the United States?", "Question text mismatch"
        assert self.question.order == 1, "Question order mismatch"
        assert self.question.question_type == "MC", "Question type mismatch"
        assert self.question.quiz == self.quiz, "Question quiz association mismatch"
        assert isinstance(self.question, Question), "question should be an instance of Question"
        assert str(self.question) == "Who was the first President of the United States?", \
            "String representation mismatch"


class OptionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.category = Category.objects.create(name="Geography")
        self.quiz = Quiz.objects.create(
            title="Geography Quiz",
            description="A quiz on geography.",
            category=self.category,
            created_by=self.user
        )
        self.question = Question.objects.create(
            quiz=self.quiz,
            text="What is the capital of France?",
            order=1,
            question_type="MC"
        )
        self.option = Option.objects.create(
            question=self.question,
            text="Paris",
            is_correct=True
        )

    def test_option_creation(self):
        assert self.option.text == "Paris", "Option text mismatch"
        assert self.option.is_correct is True, "Option correctness mismatch"
        assert self.option.question == self.question, "Option question association mismatch"
        assert isinstance(self.option, Option), "option should be an instance of Option"
        assert str(self.option) == "Paris", "String representation mismatch"
