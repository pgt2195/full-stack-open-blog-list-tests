const { test, expect, beforeEach, describe } = require('@playwright/test')
const { loginWith, addNewBlog, createNewUser, likeBlogXTime } = require('./helpers')

describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('/api/testing/reset')
    await request.post('/api/users', {
        data: {
            username: 'Pololo',
            name: 'Paul GT',
            password: 'password'
        }
    })

    await page.goto('/')
  })

  test('Login form is shown', async ({ page }) => {
    // On clique sur le bouton pour afficher le formulaire de login
    await page.getByRole('button', { name: 'login' }).click()
    // On verrifie que le texte qui doit être présent est bien là
    await expect(page.getByText('log in to application')).toBeVisible()
    await expect(page.getByText('username')).toBeVisible()
    await expect(page.getByText('password')).toBeVisible()
    // On vérifie que les deux input boxes sont bien présentes
    const textboxes = await page.getByRole('textbox').all()
    await expect(textboxes).toHaveLength(2)

  })


  describe('Login', () => {
    test('succeeds with correct credentials', async ({ page }) => {
      // On se connecte avec l'utilisateur par default
      await loginWith(page, 'Pololo', 'password')

      // On véfie que l'utilisateur est bien connecté et que le boutton
      // de déconnection est bien présent.
      await expect(page.getByText('Paul GT is logged in —')).toBeVisible()
      await expect(page.getByRole('button', { name: 'logout' })).toBeVisible()
    })

    test('fails with wrong credentials', async ({ page }) => {
      // On se connecte avec un mauvais mot de passe
      await loginWith(page, 'Pololo', 'wrong password')

      await expect(page.locator('.error')).toContainText('Wrong credentials')
      await expect(page.getByRole('button', { name: 'logout' })).not.toBeVisible()
    })
  })


  describe('When logged in', () => {
    beforeEach(async ({ page }) => {
      // On se connecte avec l'utilisateur par default
      await loginWith(page, 'Pololo', 'password')
      await addNewBlog(page, 'test title', 'test author', 'test.com')
    })

    test('a new blog can be created', async ({ page }) => {
      // On vérifie que le blog a bien été ajouté
      await expect(page.locator('.notification')).toContainText('New blog "test title" by test author has been added') // La notif s'affiche
      await expect(page.getByText('test title - by test author')).toBeVisible() // Le blog est ajouté
      await expect(page.getByRole('button', { name: 'view'})).toBeVisible() // Le bouton 'view' est présent, le blog est bien visible dans sa version minimale
    })

    test('a blog can be liked', async ({ page }) => {
      await page.getByRole('button', { name: 'view'}).click()
      await expect(page.getByText('Likes: 0')).toBeVisible()
      await page.getByRole('button', { name: 'like'}).click()
      await expect(page.getByText('Likes: 0')).not.toBeVisible()
      await expect(page.getByText('Likes: 1')).toBeVisible()
      await page.getByRole('button', { name: 'like'}).click()
      await expect(page.getByText('Likes: 1')).not.toBeVisible()
      await expect(page.getByText('Likes: 2')).toBeVisible()
    })

    test('a user can delete a blog he has posted', async ({ page }) => {
      // Accepte automatiquement le windows.confirm quand il apparaitra
      page.once('dialog', dialog => dialog.accept())

      await expect(page.getByText('test title - by test author')).toBeVisible()
      await expect(page.getByRole('button', { name: 'view'})).toBeVisible()

      await page.getByRole('button', { name: 'view'}).click()
      await page.getByRole('button', { name: 'remove blog'}).click()

      await expect(page.getByTestId('blog-unit')).not.toBeVisible() // Le blog a été supprimé
      await expect(page.getByRole('button', { name: 'hide'})).not.toBeVisible()
      await expect(page.getByRole('button', { name: 'remove blog'})).not.toBeVisible()
    })

    test('a user can cancel deletion of a blog', async ({ page }) => {
      // Accepte automatiquement le windows.confirm quand il apparaitra
      page.once('dialog', dialog => dialog.dismiss())

      await expect(page.getByText('test title - by test author')).toBeVisible()
      await expect(page.getByRole('button', { name: 'view'})).toBeVisible()
      await expect(page.getByTestId('blog-unit')).toBeVisible()

      await page.getByRole('button', { name: 'view'}).click()
      await page.getByRole('button', { name: 'remove blog'}).click()

      await expect(page.getByTestId('blog-unit')).toBeVisible()
      await expect(page.getByRole('button', { name: 'hide'})).toBeVisible()
      await expect(page.getByRole('button', { name: 'remove blog'})).toBeVisible()
    })

    test('a user can\'t delete a blog that is not his own', async ({ page, request }) => {
      await createNewUser(request, 'wrongUser', 'wrongName', 'password')
      await page.getByRole('button', { name: 'logout' }).click()
      await loginWith(page, 'wrongUser', 'password')

      await page.getByRole('button', { name: 'view' }).click()
      await expect(page.getByRole('button', { name: 'remove blog'})).not.toBeVisible() 
    })
  })


  test('blogs are ordered by number of likes', async ({ page }) => {
    // Créer des nouveaux blogs
    await loginWith(page, 'Pololo', 'password')
    for (let i = 0; i < 4; i++) {
      await addNewBlog(page, `test title ${i}`, `test author ${i}`, `test.com ${i}`)
    }
    await expect(page.getByTestId('blog-unit')).toHaveCount(4)

    // Liker les nouveaux blogs avec un nombre de like différent pour chaque
    const blogUnits = await page.getByTestId('blog-unit')

    await likeBlogXTime(blogUnits.filter({ hasText: 'test title 3' }), 5)
    await likeBlogXTime(blogUnits.filter({ hasText: 'test title 2' }), 3)
    await likeBlogXTime(blogUnits.filter({ hasText: 'test title 1' }), 2)
    await likeBlogXTime(blogUnits.filter({ hasText: 'test title 0' }), 1)

    // Vérifier qu'ils sont bien classés par nombre de like
    await expect(blogUnits.nth(0)).toContainText('Likes: 5')
    await expect(blogUnits.nth(1)).toContainText('Likes: 3')
    await expect(blogUnits.nth(2)).toContainText('Likes: 2')
    await expect(blogUnits.nth(3)).toContainText('Likes: 1')
  })
  
})