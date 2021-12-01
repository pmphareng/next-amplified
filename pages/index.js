// pages/index.js
import { AmplifyAuthenticator } from '@aws-amplify/ui-react';
import { Amplify, API, Auth, withSSRContext } from 'aws-amplify';
import Head from 'next/head';
import awsExports from '../src/aws-exports';
import { createTodo } from '../src/graphql/mutations';
import { listTodos } from '../src/graphql/queries';
import styles from '../styles/Home.module.css';

Amplify.configure({ ...awsExports, ssr: true });

export async function getServerSideProps({ req }) {
	const SSR = withSSRContext({ req });
	const response = await SSR.API.graphql({ query: listTodos });

	return {
		props: {
			todos: response.data.listTodos.items,
		},
	};
}

async function handleCreateTodo(event) {
	event.preventDefault();

	const form = new FormData(event.target);

	try {
		const { data } = await API.graphql({
			authMode: 'AMAZON_COGNITO_USER_POOLS',
			query: createTodo,
			variables: {
				input: {
					name: form.get('name'),
					description: form.get('description'),
				},
			},
		});

		window.location.href = `/todos/${data.createPost.id}`;
	} catch ({ errors }) {
		console.error(...errors);
		throw new Error(errors[0].message);
	}
}

export default function Home({ todos = [] }) {
	return (
		<div className={styles.container}>
			<Head>
				<title>Amplify + Next.js</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>Amplify + Next.js</h1>

				<p className={styles.description}>
					<code className={styles.code}>{todos.length}</code>
					todos
				</p>

				<div className={styles.grid}>
					{todos.map((todo) => (
						<a className={styles.card} href={`/todos/${todo.id}`} key={todo.id}>
							<h3>{todo.name}</h3>
							<p>{todo.description}</p>
						</a>
					))}

					<div className={styles.card}>
						<h3 className={styles.title}>New todo</h3>

						<AmplifyAuthenticator>
							<form onSubmit={handleCreateTodo}>
								<fieldset>
									<legend>Name</legend>
									<input
										defaultValue={`Today, ${new Date().toLocaleTimeString()}`}
										name='name'
									/>
								</fieldset>

								<fieldset>
									<legend>Description</legend>
									<textarea
										defaultValue='I built an Amplify app with Next.js!'
										name='description'
									/>
								</fieldset>

								<button>Create Todo</button>
								<button type='button' onClick={() => Auth.signOut()}>
									Sign out
								</button>
							</form>
						</AmplifyAuthenticator>
					</div>
				</div>
			</main>
		</div>
	);
}
