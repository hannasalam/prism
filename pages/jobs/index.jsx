import React, { useEffect, useState } from 'react';
import CustomTitle from '../../utils/CustomTitle';
import JobCard from '../../components/JobCard/JobCard';
import Navbar from '../../components/Navbar/Navbar';
import jobsData from '../../data/jobsData';
import { useRouter } from 'next/router';
import { Contract, ethers } from 'ethers';

import { supportedNetworks } from '../../utils/networks';
const jobsAbi =
	require('../../contracts/artifacts/contracts/jobsVerified.sol/LGBTQJobMarketVerified.json').abi;

export default function JobsPage() {
	const router = useRouter();

	const [jobs, setJobs] = useState([]);
	const [loading, setLoading] = useState(false);

	async function fetchJobs() {
		setLoading(true);
		if (!window?.ethereum) {
			alert('Please install metamask');
			return;
		}

		const provider = new ethers.providers.Web3Provider(
			window.ethereum,
			'any'
		);

		if (!provider) {
			alert('Provider not found');
			return;
		}
		const { chainId } = await provider.getNetwork();
		if (
			Object.values(supportedNetworks).find((id) => {
				return id.toString() === chainId.toString();
			}) === undefined
		) {
			alert(
				`Please switch to a supported network. Your current network is ${chainId}. Supproted chain ids are [${Object.values(
					supportedNetworks
				).join(', ')}]`
			);
			return;
		}

		try {
			await provider.send('eth_requestAccounts', []);
			const signer = provider.getSigner();

			if (!signer) {
				alert('Signer not found');
				return;
			}

			if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
				alert('Contract address not found');
				return;
			}

			const contract = new Contract(
				process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
				jobsAbi,
				signer
			);

			const jobRes = await contract.getJobs();
      console.log(jobRes);

        const mappedJob = jobRes.map((job) => {
          return {
            id: 1,
            company_name: job.companyName,
            role: job.jobTitle,
            phone: "9496592365",
            email: job.employer,
            description: job.jobDescription,
            location: "Location",
            tags: job.tags,
          }
        });

        console.log(mappedJob);
			setJobs([...mappedJob])
		} catch (e) {
			console.log('Error fetching jobs', e);
		}

		setLoading(false);
	}

	useEffect(() => {
		fetchJobs();
	}, []);

	return (
		<>
			<CustomTitle title='Jobs' />
			<Navbar />
			<div className={'jobs__container'}>
				<div className={'jobs__heading'}>JOBS</div>
				<button
					class='job_card_apply'
					style={{
						padding: '1rem',
						borderRadius: '4px',
						fontSize: '15px',
						cursor: 'pointer',
					}}
					onClick={() => router.push('/jobs/create')}
				>
					Add Job
				</button>
				<div className={'jobs__list'}>
					{loading
						? 'Loading'
						: jobs.map((job) => {
								return <JobCard job={job} />;
						  })}
				</div>
			</div>
		</>
	);
}
